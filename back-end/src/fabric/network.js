'use strict';

// dependencies
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
var rimraf = require("rimraf"); // used to call rm -rf 

// connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

// connect to the connection file
const ccpPath = path.join(process.cwd(), config.connectionProfile);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const util = require('util');

exports.createWallet = async function () {

    try {

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[config.caName];
        const ca = new FabricCAServices(caInfo.url, { verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');

        // Remove wallet folder if exists
        rimraf.sync(walletPath);

        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: config.appAdmin, enrollmentSecret: config.appAdminSecret });
        const identity = X509WalletMixin.createIdentity(config.orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        
        await wallet.import(config.appAdmin, identity);

        return { message: `Successfully enrolled admin user ${config.appAdmin} and imported it into the wallet` };

    } catch (error) {

        return { error: error.toString() };
    }
}

exports.initLedger = async function (networkObj) {
    try {

        let response = await networkObj.contract.submitTransaction('initLedger');
        await networkObj.gateway.disconnect();
        return response.toString();
    } catch (error) {
        let response = { error: 'the following errors ocurred: ' + error.toString()};
        for (var key in error) {
            response.error += key + ' - ' + error[key];
        }
        return response;
    }
};

exports.connectToNetwork = async function () {

    const gateway = new Gateway();

    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const userExists = await wallet.exists(config.appAdmin);
        if (!userExists) {
            console.log('An identity for the user ' + config.appAdmin + ' does not exist in the wallet');
            let response = { error: 'An identity for the user ' + config.appAdmin + ' does not exist in the wallet. Register ' + config.appAdmin + ' first' };
            return response;
        }

        await gateway.connect(ccp, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });

        // Connect to our local fabric
        const network = await gateway.getNetwork('mychannel');

        // Get the contract we have installed on the peer
        const contract = network.getContract('cargoguard');

        let networkObj = {
            contract: contract,
            network: network,
            gateway: gateway
        };

        return networkObj;

    } catch (error) {

        let response = { error: 'the following errors ocurred: ' + error.toString()};
        for (var key in error) {
            response.error += key + ' - ' + error[key];
        }
        return response;
    } 
};

exports.startShipment = async function (networkObj, shipmentId, startTimestamp) {
    try {

        let response = await networkObj.contract.submitTransaction('startShipment',shipmentId,startTimestamp);
        await networkObj.gateway.disconnect();
        return response.toString();
    } catch (error) {
        let response = { error: 'the following errors ocurred: ' + error.toString()};
        for (var key in error) {
            response.error += key + ' - ' + error[key];
        }
        return response;
    }
};

exports.registerEvent = async function (networkObj, containerId, timestamp, sensorDataType, measuredVal) {
    try {

        let response = await networkObj.contract.submitTransaction('registerEvent', containerId, timestamp, sensorDataType, measuredVal);
        await networkObj.gateway.disconnect();
        return response.toString();
    } catch (error) {
        let response = { error: 'the following errors ocurred: ' + error.toString()};
        for (var key in error) {
            response.error += key + ' - ' + error[key];
        }
        return response;
    }
};

exports.endShipment = async function (networkObj, shipmentId, endTimestamp) {
    try {

        let response = await networkObj.contract.submitTransaction('endShipment',shipmentId, endTimestamp);
        await networkObj.gateway.disconnect();
        return response.toString();
    } catch (error) {
        let response = { error: 'the following errors ocurred: ' + error.toString()};
        for (var key in error) {
            response.error += key + ' - ' + error[key];
        }
        return response;
    }
};

exports.query = async function (networkObj, queryName, args) {
    try {
        let response;
        if(args) {
            response = await networkObj.contract.evaluateTransaction(queryName, ... args);
        } else {
            response = await networkObj.contract.evaluateTransaction(queryName);
        }

        await networkObj.gateway.disconnect();
        return response.toString();
    } catch (error) {
        let response = { error: 'the following errors ocurred: ' + error.toString()};
        for (var key in error) {
            response.error += key + ' - ' + error[key];
        }
        return response;
    }
};


