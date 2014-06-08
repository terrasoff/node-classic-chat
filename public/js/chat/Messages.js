/**
 * Now this collection is delivering only history messages
 * There are minds to link it with database
 */
var Backbone = Backbone || require('backbone');
var _ = _ || require('underscore');

var Chat = Chat || {};

Chat.Messages = Backbone.Collection.extend(
{
    db: null,
    limit: null,

    initialize: function(models, options)
    {
        _.extend(this, options);
        Chat.Messages.__super__.initialize.call(this, models, options);
    },

    load: function(callback, since, history)
    {
        if (since == undefined) since = null;
        if (history == undefined) history = 0;

//        console.dir(since);
        var condition = since
            ? {created: {$lt: new Date(since)}}
            : {};

        console.dir(condition);

        this.db.collection('messages')
            .find(condition)
            .sort({_id: 0})
            .limit(this.limit)
            .toArray(function(err, docs) {
                callback(err, docs, history)
            })

    }
});

if (typeof exports !== 'undefined')
    module.exports = Chat.Messages;