//file server has a mission which declares port -> start up server
const app = require("./src/app")
const PORT = process.env.PORT || 3055;

const server = app.listen(PORT, ()=>{
    console.log(`localhost:${PORT}`);
});

//server disconnect:
/*process.on('SIGINT', ()=>{
    server.close( ()=> console.log(`Exit server express`) )
})*/
