'use strict'

const dev = {
    db: {
        R0001: process.env.ROLE1 || 'SHOP',
        R0002:  process.env.ROLE2 || 'WRITER',
        R0003:  process.env.ROLE3 || 'EDITOR',
        R0004: process.env.ROLE4 || 'ADMIN'
    }
}

module.exports = dev;
