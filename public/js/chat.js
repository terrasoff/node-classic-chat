$(function()
{
	var socket = io.connect('/chat');

	// cache some jQuery objects
    var $login = $(".login");
    var $users = $(".users");
    var $scenario = $(".scenario");
    var $userbox = $('#userbox');
    var $mesaagebox = $('#messagebox');
    var $messages = $('#messages');
    var $btn_history = $('#history');
    var $chat = $('#chat');

    var users = new Backbone.Collection();
    var messages = new Backbone.Collection();

	socket.on('connect', function(data)
    {
        setScenario('login');
	});

    socket.on('users', function(data)
    {
        console.log("users");
        for(var i in data.users)
            users.add(new Chat.User(data.users[i]));
    });

    socket.on('login', function(data)
    {
        console.dir(data);
        $userbox.find('label').html(data.name);
        setScenario('chat');
    });

    socket.on('join', function(data)
    {
        console.log("join"); console.dir(data);
        users.add(new Chat.User(data));
    });

    socket.on('server:error', function(data)
    {
        alert(data.error);
    });

    socket.on('disconnect', function()
    {
        var model;
        while (model = users.first())
            model.destroy();
        setScenario('disconnect');
    });

    // render messages
    socket.on('messages', function(items)
    {
        var total = items.length;
        if (total) {
            for(var i=total-1; i>=0; i--)
                messages.push(new Chat.Message(items[i]));

            if ($chat.hasClass('empty')) $chat.removeClass('empty');
        }
    });

    // render messages
    socket.on('messages:history', function(items)
    {
        var total = items.length;
        if (total) {
            for(var i=0; i<total; i++)
                messages.unshift(new Chat.Message(items[i]), {history: true});

            if ($chat.hasClass('empty')) $chat.removeClass('empty');
        }
    });

    socket.on('message:receive', function(data)
    {
        messages.push(new Chat.Message(data));
        if ($chat.hasClass('empty')) $chat.removeClass('empty');
    });


    // leave chat event
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
        console.log("add user"); console.dir(model);
        // for each list of users (we have 2 lists)
        $users.each(function() {
            var view = new Chat.UserView({model: model});
            $(this).find('.items > div').append(view.$el);
            $(this).toggleClass('empty', users.length < 1);
        });
    });

    // add (render) new message
    messages.on('add', function(model, collection, options) {
//        console.log("render"); console.dir(options);
        var view = new Chat.MessageView({model: model});
        options.history != undefined
            ? $messages.prepend(view.$el)
            : $messages.append(view.$el);
    });

    // leave chat scenario
    $userbox.find('button').on('click', function() {
        socket.emit('leave');
        setScenario('login');
    });

    $login.find('input').on('keypress', function(e)
    {
        if (e.keyCode == 13)
        {
            e.preventDefault();
            name = $.trim($(this).val());
            if(name.length < 1)
                alert("Please enter a nick name longer than 1 character!");
            else
                socket.emit('login', {name: name});
        }
    });

    $mesaagebox.on('keypress', function(e)
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
        }
    });

    // leave chat scenario
    $btn_history.on('click', function(e) {
        socket.emit('history', {
            since: messages.length ? messages.first().get('date') : null
        });
    });

    function setScenario(name) {
        $scenario.attr('data-view', name);
    }

});