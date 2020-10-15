const WebSocket = require('ws');

const connections = [];

exports.registerListener = async function (network,eventName) {
    try {

        let networkObj = await network.connectToNetwork();

        if (networkObj.error) {
            console.error(networkObj.error);
            process.exit(1);
        }
    
        await networkObj.contract.
            addContractListener(`${eventName}-listener`, eventName, 
                    (err, event, blockNumber, transactionId, status) => {
        
            if (err) {
                console.error(err);
                process.exit(1);
            }
    
            //convert event to object
            event = event.payload.toString();
            event = JSON.parse(event);

            // iterate over connections
            connections.forEach( item => {
                // send event if it is registered in the connection configuration
                if(item.eventConfig.events.indexOf(event.eventName) != -1) {
                    item.connection.send(JSON.stringify(event));
                }
            });

            console.log('event',event);
        });

    } catch(error) {
        console.error(error);
        process.exit(1);
    }
}

exports.createWebSocketServer = async function () {
    const wss = new WebSocket.Server({ port: 8081 });

    wss.on('connection', function connection(ws) {

        ws.on('message', function incoming(eventConfigJson) {

            const eventConfig = JSON.parse(eventConfigJson);
            connections.push({ connection: ws, eventConfig: eventConfig });

            console.log('registered - active websocket connections:',connections.length);

        });

        ws.on('close', function close() {

            console.log('closed received ');

            connections.forEach( (item,position) => {
                if(item.connection == ws) {
                    console.log(`found at pos ${position}`);
                    connections.splice(position,1);
                    return;
                }
            });
            console.log('unregistered - active websocket connections: ',connections.length);
        })

    });
}