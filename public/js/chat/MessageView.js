var Backbone = Backbone || require('backbone');
var _ = _ || require('underscore');

var Chat = Chat || {};

Chat.MessageView = Backbone.View.extend(
{
    className: "message",
    // TODO: move templates to view
    template: _.template(
        '<div class="message-date"><%- new Date(created).toFormat("YYYY-MM-DD HH24:MM") %></div>' +
        '<div class="message-name"><%- user.name %></div>' +
        '<div class="message-message"><%- message %></div>'+
        '<br class="clear" />'
    ),

    initialize: function()
    {
        this.model.on('destroy', function() {
            this.remove();
        }.bind(this));

        return this.render();
    },

    render: function()
    {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

if (typeof exports !== 'undefined')
    module.exports = Chat.MessageView;