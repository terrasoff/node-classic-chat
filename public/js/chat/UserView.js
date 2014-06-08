var Backbone = Backbone || require('backbone');
var _ = _ || require('underscore');

var Chat = Chat || {};

Chat.UserView = Backbone.View.extend(
{
    // TODO: move templates to view
    template: _.template('<div class="user"><%- name %></div>'),

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
    module.exports = Chat.User;