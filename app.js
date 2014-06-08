var settings = require('./settings');
var app = require('express')();

require('./config')(app, settings);
require('./routes')(app);

// define store
require('mongodb').MongoClient.connect(settings.db.mongo.dsn, function(err, store) {
    if (err)
        throw "Can't connect mongodb!";

    require('./chat')(app, settings, store);
    console.log('Your application is running on http://localhost:' + settings.port);
});