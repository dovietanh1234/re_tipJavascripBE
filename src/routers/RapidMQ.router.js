module.exports = function(app){

    // declare controller:
    const {rapid_mq} = require('../controllers/RapidMQ.controller')

    app.get('/ex-rapidMQ', rapid_mq);


}