var settings = require('./settings');
var app = require('express')();

require('./config')(app, settings);
require('./chat')(app, settings);
require('./routes')(app);

console.log('Your application is running on http://localhost:' + settings.port);