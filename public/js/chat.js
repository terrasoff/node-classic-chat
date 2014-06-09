$(function()
{
	var socket = io.connect('/chat');
    scenario = '';

	// cache some jQuery objects
    var $form = $(".login form");
    var $users = $(".users");
    var $scenario = $(".scenario");
    var $userbox = $('#userbox');
    var $messagebox = $('#messagebox');
    var $messages = $('#messages');
    var $btn_history = $('#history');
    var $chat = $('#chat');

    var users = new Backbone.Collection();
    var messages = new Backbone.Collection();

	socket.on('connect', function()
    {
        setScenario('login');
	});

    // current list of online users
    socket.on('users', function(data)
    {
        _.each(data.users, function(user) {
            users.add(new Chat.User(user));
        })
    });

    // login to chat
    socket.on('login', function(data)
    {
        // preload messages (if necessary)
        if (!messages.length)  {
            var total = data.messages.length;
            if (total) {
                for(var i=total-1; i>=0; i--)
                    messages.push(new Chat.Message(data.messages[i]));

                if ($chat.hasClass('empty')) $chat.removeClass('empty');
            }
        }

        // prepare UI
        setScenario('chat');
        $userbox.find('label').html(data.user.username);
        $messagebox.val('');
        $messagebox.focus();
    });

    socket.on('join', function(data)
    {
        console.log("join"); console.dir(data);
        users.add(new Chat.User(data));
    });

    // some error happened
    socket.on('server:error', function(data)
    {
        console.dir(data.error);
        alert(data.error);
    });

    socket.on('disconnect', function()
    {
        var model;
        // no more users online
        while (model = users.first())
            model.destroy();
        setScenario('disconnect');
    });

    // render loaded history messages
    socket.on('messages:history', function(items)
    {
        var total = items.length;
        if (total) {
            for(var i=0; i<total; i++)
                messages.unshift(new Chat.Message(items[i]), {history: true});

            if ($chat.hasClass('empty')) $chat.removeClass('empty');
        }
    });

    // new message in chat
    socket.on('message:receive', function(data)
    {
        messages.push(new Chat.Message(data));
        if ($chat.hasClass('empty')) $chat.removeClass('empty');
    });

    // someone leaves chat
    socket.on('leave',function(data)
    {
        var model = users.findWhere(data);
        if (model) {
            model.destroy();
            $users.each(function() {
                $(this).toggleClass('empty', users.length < 1);
            });
        }
    });

    // add (render) new user
    users.on('add', function(model)
    {
        // for each list of users (we have 2 lists)
        $users.each(function() {
            var view = new Chat.UserView({model: model});
            $(this).find('.items > div').append(view.$el);
            $(this).toggleClass('empty', users.length < 1);
        });
    });

    // add (render) new message in chat
    messages.on('add', function(model, collection, options) {
        var view = new Chat.MessageView({model: model});
        options.history != undefined
            ? $messages.prepend(view.$el)
            : $messages.append(view.$el);
    });

    // leave chat
    $userbox.find('button').on('click', function() {
        socket.emit('leave');
        setScenario('login');
    });

    // try to login
    $form.on('keypress', function(e)
    {
        if (e.keyCode == 13)
        {
            e.preventDefault();
            var data = {
                username: $.trim($(this).find('[name="username"]').val()),
                password: $(this).find('[name="password"]').val()
            };
            socket.emit('action:'+$(this).data('action'), data);
        }
    });

    // send message to chat
    $messagebox.on('keypress', function(e)
    {
        // send by ctrl+enter
        if (e.ctrlKey && e.keyCode === 10)
        {
            e.preventDefault();
            var message = $.trim($(this).val());
            if (message) {
                var data = {message: message};
                socket.emit('message:send', data);
            }
            $messagebox.val('');
        }
    });

    // try to get history messages
    $btn_history.on('click', function(e) {
        socket.emit('history', {
            since: messages.length ? messages.first().getDate() : null
        });
    });

    /**
     * Set current scenario
     * Using for page management and some loginc
     * @param name
     */
    function setScenario(name) {
        scenario = name;
        $scenario.attr('data-view', name);
    }

    $(window).on('beforeunload', function()
    {
        if (scenario === 'chat')
            return 'Leave chat?';
    });

});