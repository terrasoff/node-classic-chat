var _ = require('underscore');
var Backbone = require('backbone');
var User = require('./public/js/chat/User');
var Messages = require('./public/js/chat/Messages');

module.exports = function(app, settings, db)
{
    var io = require('socket.io').listen(app.listen(settings.port));

    var users = new Backbone.Collection();

    var messages;

    messages = new Messages(null,{
        db: db,
        limit: settings.messages.pageSize
    });

    io.of('/chat').on('connection', function (socket)
    {
        console.log("connected");

        socket.emit('users', {users: users});

        // user try to login
        socket.on('login', function(data)
        {
            // checking uniqueness
            if (users.findWhere(data)) {
                console.log("exists");
                socket.emit('server:error', {'error': 'login is busy'});
            }
            else
            {
                // Preload chat messages from store before login
                messages.load(function(err, docs)
                {
                    // current user data
                    var model = new User(data);
                    socket.user = model;
                    users.add(socket.user);

                    socket.broadcast.emit('join', model.attributes);
                    socket.emit('login', {
                        user: model.attributes,
                        messages: docs
                    });
                });

            }
        });

        // Load history messages
        socket.on('history', function(data)
        {
            if (socket.user)
            {
                messages.load(function(err, docs) {
                    socket.emit('messages:history', docs);
                }, data.since, true);
            }
            else socket.emit('server:error', {'error': 'need to login'});
        });

        // You were disconnected
        socket.on('disconnect', function() {
            if (socket.user) {
                socket.broadcast.emit('leave', socket.user.attributes);
                socket.user.destroy();
            }
            else socket.emit('server:error', {'error': 'need to login'});
        });

        // User left the chat
        socket.on('leave', function() {
            if (socket.user) {
                socket.broadcast.emit('leave', socket.user.attributes);
                socket.user.destroy();
            }
            else socket.emit('server:error', {'error': 'need to login'});
        });

        // Send message to chat
        socket.on('message:send', function(data)
        {
            if (socket.user)
            {
                var data = {
                    message: data.message,
                    user: socket.user.attributes,
                    created: new Date()
                };
                // saves it to database before send
                db.collection('messages').insert(data, function(err, docs) {
                    if (err)
                        socket.emit('error', err);
                    else {
                        // now everybody sees this message
                        socket.broadcast.emit('message:receive', data);
                        socket.emit('message:receive', data);
                    }
                });
            }
            else socket.emit('server:error', {'error': 'need to login'});
        });

    });

};