var Backbone = Backbone || require('backbone');

var Chat = Chat || {};

Chat.User = Backbone.Model.extend({
    getName: function() {
        return this.get('name');
    }
});

if (typeof exports !== 'undefined')
    module.exports = Chat.User;