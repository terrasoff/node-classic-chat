var Chat = Chat || {};
var Backbone = Backbone || require('backbone');

Chat.Message = Backbone.Model;

if (typeof exports !== 'undefined')
    module.exports = Chat.Message;