module.exports = function() {
    return {
        port: 8081,
        messages: {
            pageSize: 3
        },
        db: {
            mongo: {
                dsn: "mongodb://user:user@localhost:27017/test"
            }
        },
        cookie: {
            secret: 'secret'
        }
    }
}();