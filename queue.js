#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const scraper = require("./scraper");

module.exports = {
    queue: function(){
        return amqp.connect('amqp://ikjxfagn:BgDGP3UVp2x6hIbY1OusfL1r2IXWCJXp@stingray.rmq.cloudamqp.com/ikjxfagn', function (error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(async function (error1, channel) {
                if (error1) {
                    throw error1;
                }
                var queue = 'rpc_queue';
                channel.assertQueue(queue, {
                    durable: false
                });
                channel.prefetch(1);
                console.log(' [x] Awaiting RPC (scrape) requests');
                //reciving course code 
                channel.consume(queue, async function reply(msg) {
                    //get the code from msg object
                    const code = msg.content.toString();
                    console.log(" [.] scrape(code=%d)", code);
                    //scrape the urls
                    const urls = await scraper.start(code);
                    //send urls to the consumer
                    channel.sendToQueue(msg.properties.replyTo,
                        Buffer.from(urls.toString()), {
                        correlationId: msg.properties.correlationId
                    });
                    channel.ack(msg);
                });
            });
        
        });

    }
}
