var Backbone = Backbone || require('backbone');

var Chat = Chat || {};

Chat.Message = Backbone.Model.extend(
{
    getDate: function() {
        return this.get('created');
    }
});

if (typeof exports !== 'undefined')
    module.exports = Chat.Message;