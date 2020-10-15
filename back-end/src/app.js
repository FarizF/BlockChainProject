'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let eventHandler = require('./event-handler.js');
let network = require('./fabric/network.js');

/**
 * Initialising the ledger
 */
app.post('/rest/ledger', async (req, res) => {

    try {

        let networkObj = await network.connectToNetwork();

        if (networkObj.error) {
            res.status(400).json({ message: networkObj.error });
            return;
        }

        let invokeResponse = await network.initLedger(networkObj);

        if (invokeResponse.error) {
            res.status(400).json({ message: invokeResponse.error });
        } else {
            res.status(200).json({ message: invokeResponse });
        }

    } catch(error) {
        res.status(500).json({ error: error.toString() } );
    }

});

/**
 * Starting Shipment
 * 
 */
app.post('/rest/shipments/:shipmentId/start', async (req, res) => {

    try {
        let networkObj = await network.connectToNetwork();

        if (networkObj.error) {
            res.status(400).json({ message: networkObj.error });
        }

        let invokeResponse = await network.startShipment(networkObj, req.params.shipmentId, req.body.startTimestamp);

        if (invokeResponse.error) {
            res.status(400).json({ message: invokeResponse.error });
        } else {
            res.status(200).json({ message: invokeResponse });
        }
    } catch(error) {
        res.status(500).json({ error: error.toString() } );
    }
});


/**
 * Registering a sensor event
 * 
 */
app.post('/rest/container-event', async (req, res) => {

    try {

        let networkObj = await network.connectToNetwork();

        if (networkObj.error) {
            res.status(400).json({ message: networkObj.error });
            return;
        }

        let invokeResponse = await network.registerEvent(networkObj, req.body.containerId, 
                                                            req.body.timestamp,req.body.sensorDataType,
                                                            req.body.measuredVal);

        if (invokeResponse.error) {
            res.status(400).json({ message: invokeResponse.error });
        } else {
            res.status(200).json({ message: invokeResponse });
        }
    } catch(error) {
        res.status(500).json({ error: error.toString() } );
    }

});

/**
 * Getting events of a container
 * 
 */
app.get('/rest/containers/:id/events', async (req, res) => {

    let networkObj = await network.connectToNetwork();

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    const params = [req.params.id,req.query.startDate, req.query.endDate ? req.query.endDate : '29991231235959'];
    
    if(req.query.sensorDataType) {
        params.push(req.query.sensorDataType);
    }

    let invokeResponse = await network.query(networkObj, 'queryEvents',params);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});


/**
 * Finishing Shipment
 * 
 */
app.post('/rest/shipments/:shipmentId/end', async (req, res) => {

    try {
        let networkObj = await network.connectToNetwork();

        if (networkObj.error) {
            res.status(400).json({ message: networkObj.error });
        }

        let invokeResponse = await network.endShipment(networkObj, req.params.shipmentId, req.body.endTimestamp);

        if (invokeResponse.error) {
            res.status(400).json({ message: invokeResponse.error });
        } else {
            res.status(200).json({ message: invokeResponse });
        }
    } catch(error) {
        res.status(500).json({ error: error.toString() } );
    }
});

/**
 * Getting Rules
 * 
 */
app.get('/rest/rules', async (req, res) => {

    let networkObj = await network.connectToNetwork();

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.query(networkObj, 'queryRules');

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});

/**
 * Getting a specific rule
 * 
 */
app.get('/rest/rules/:id', async (req, res) => {

    let networkObj = await network.connectToNetwork();

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.query(networkObj, 'queryRule',[req.params.id]);

    console.log(`[${invokeResponse}]`);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else if (invokeResponse == '') {
        res.status(404).json({ message: `Rule with id ${req.params.id} not found` });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});

/**
 * Getting agreements of a shipment
 * 
 */
app.get('/rest/shipments/:id/transit-agreements', async (req, res) => {

    let networkObj = await network.connectToNetwork();

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.query(networkObj, 'queryTransitAgreements',[req.params.id]);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});

/**
 * Getting Shipments
 * 
 */
app.get('/rest/shipments', async (req, res) => {

    let networkObj = await network.connectToNetwork();

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.query(networkObj, 'queryShipments');

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});

// Create a wallet for demo purposes, then start the REST server
network.createWallet().then( res => {

    const port = process.env.PORT || 8080; 
    app.listen(port);
    console.log(`listening on port ${port}`);
    eventHandler.createWebSocketServer();
    eventHandler.registerListener(network,'containerEventCreated');

}).catch( error => {
    console.error(`Error creating wallet ${error.toString()}`);
    process.exit(1);
});
