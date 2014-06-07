module.exports = function() {
    return {
        port: 8081,
        db: {
            mongo: {
                session: {
                    db: 'test',
                    collection: 'session',
                    username: 'admin',
                    password: 'admin'
                }
            }
        },
        cookie: {
            secret: 'secret'
        }
    }
}();