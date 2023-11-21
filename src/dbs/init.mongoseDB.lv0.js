'use strict'

const mongoose = require('mongoose');

const connectString = `mongodb://localhost:27017/tipjavascript`
mongoose.connect( connectString )
.then( _ => console.log(`connected mongoseDB success`))
.catch( err => console.log(`error connect`))

// for dev( debug mode )
if( 1 === 1 ){
    mongoose.set('debug', true)
    mongoose.set('debug', { color: true })
}

module.exports = mongoose

// => nếu trên PHP or Java ta làm thế này sẽ dẫn đến tình trạng nhiều kết nối được tạo ra cho cùng 1 CSDL
// => dẫn đến ko hiệu quả và gây quá tải trong quá trình kết nối 