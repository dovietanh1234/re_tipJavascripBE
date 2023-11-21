'use strict'

// level 0:
// const config = {
//     app: {
//         port: 3000
//     },
//     db: {
//         host: 'localhost',
//         port: 27017,
//         name: 'tipjavascript'
//     }
// }

// level 2: creating dev enviroment && creating test enviroment
const dev = {
    app: {
        port: process.env.PORT || 3000
    },
    db: {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT_DB || 27017,
        name: process.env.NAME_DB_1 || 'admin'
    }
}

const test = {
    app: {
        port: process.env.PORT || 3000
    },
    db: {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT_DB || 27017,
        name: process.env.NAME_DB_2 || 'admin'
    }
}


const config = { dev, test }
const env = process.env.NODE_ENV || 'test'
module.exports = config[env]