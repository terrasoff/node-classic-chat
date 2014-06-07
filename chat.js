var gravatar = require('gravatar');
var session = require('express-session');
var MongoSession = require('connect-mongo')(session);
var SessionSocket = require('session.socket.io');
var bodyParser = require('cookie-parser')();

function findCookie(handshakeInput, key) {
    // fix for express 4.x (parse the cookie sid to extract the correct part)
    var handshake = JSON.parse(JSON.stringify(handshakeInput)); // copy of object

    if(handshake.secureCookies && handshake.secureCookies[key]) handshake.secureCookies = handshake.secureCookies[key].match(/\:(.*)\./).pop();
    else if(handshake.signedCookies && handshake.signedCookies[key]) handshake.signedCookies[key] = handshake.signedCookies[key].match(/\:(.*)\./).pop();
    else if(handshake.cookies && handshake.cookies[key]) handshake.cookies[key] = handshake.cookies[key].match(/\:(.*)\./).pop();

    // original code
    return (handshake.secureCookies && handshake.secureCookies[key])
        || (handshake.signedCookies && handshake.signedCookies[key])
        || (handshake.cookies && handshake.cookies[key]);
}

module.exports = function(app, settings)
{
    var sessionStore = new MongoSession(settings.db.mongo.session);

    app.use(bodyParser);
    app.use(session({
        secret: settings.cookie.secret,
        store: sessionStore
    }));

    var sessionSocket = new SessionSocket(
            require('socket.io').listen(app.listen(settings.port)),
            sessionStore,
            bodyParser);

    var users = [];

    var chat = sessionSocket.of('/socket').on('connection', function (error, socket, session)
    {
        if (error)
        {
            console.log(error);
        }
        else
        {
            socket.on('login', function(data)
            {
                data.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
                var sid = findCookie(socket.handshake, 'connect.sid');

                var pk = {_id: sid};
                sessionStore.db.collection('session').findOne(pk, function(err, session) {
                    session.data = data;
                    console.dir(session);

                    sessionStore.db.collection('session').update(pk, {$set: {data: data}}, function(err) {
                        if (err) console.warn(err.message);
                        else socket.emit('chat', data);
                    });

                });
            });

            // Somebody left the chat
            socket.on('disconnect', function() {

                // Notify the other person in the chat room
                // that his partner has left

                socket.broadcast.to(this.room).emit('leave', {
                    boolean: true,
                    room: this.room,
                    user: this.username,
                    avatar: this.avatar
                });

                // leave the room
                socket.leave(socket.room);
            });


            // Handle the sending of messages
            socket.on('msg', function(data){

                // When the server receives a message, it sends it to the other person in the room.
                socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
            });
        }
    });
};
