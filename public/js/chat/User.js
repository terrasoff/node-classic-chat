var Backbone = Backbone || require('backbone');
var _ = _ || require('underscore');

var Chat = Chat || {};

Chat.User = Backbone.Model.extend(
{
    getName: function() {
        return this.get('name');
    },
    initialize: function(attributes, options)
    {
        _.extend(this, options);
        Chat.User.__super__.initialize.call(this, attributes, options);
    },

    authenticate: function(username, password, callback) {
        var condition = {
            username: username,
            password: this.getPassword(password)
        };
        this.db.collection('users').find(condition).limit(1).toArray(callback);
    },
    getPassword: function(password) {
    	return this.hash(password);
    },
    hash: function(string) {
        return string.split('').reverse().join('');
    }
});

if (typeof exports !== 'undefined')
    module.exports = Chat.User;