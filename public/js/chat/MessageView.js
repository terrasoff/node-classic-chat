var Chat = Chat || {};
var Backbone = Backbone || require('backbone');
var _ = _ || require('underscore');

Chat.MessageView = Backbone.View.extend(
{
    template: _.template('<div class="item"><%- message %></div>'),

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