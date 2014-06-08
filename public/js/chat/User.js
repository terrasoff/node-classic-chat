var Chat = Chat || {};
var Backbone = Backbone || require('backbone');
Chat.User = Backbone.Model.extend({
    getName: function() {
        return this.get('name');
    }
});

if (typeof exports !== 'undefined')
    module.exports = Chat.User;