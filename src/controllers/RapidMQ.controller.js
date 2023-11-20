const amqp = require("amqplib");
const queue = "node_channel";

var that = module.exports = {
    rapid_mq: async ()=>{
        const connect = async (text)=>{
            try{
                //connect with port rapidMQ
                const connect = await amqp.connect("amqp://localhost:5672");
                const channel = await connect.createChannel();
                
                // đóng cổng:
                process.once("SIGNINT", async ()=>{
                    await channel.close();
                    connect.close();
                });

                // parse type data to transfer data for project BE2 
                await channel.assertQueue(queue);
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(text)));

            }catch(error){
                console.log(error);
            }
        }

        const data = {
            id: 1,
            content: "test thử queue"
        }
        connect(data);
    }



}