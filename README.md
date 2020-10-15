##  BC4EDU Cargo-guard Project

This project aims at creating a demonstration of a supply chain application. 

## Prerequisites

TODO: Specify project pre-requisites

## The Use Case

TODO: Describe Project Use Case

## Network Configuration

The network can be executed in two environments: the local blockchan provided by the IBM blockchain plugin or the predefined network with two organisations and four peers. Follow the instructions, according to your preference.

### Local Blockchain

1. Start your local network using the IBM Blockchain Plugin for Visual Studio Code
2. Go to the *Fabric Gateways* box on the left-hand side panel. 
3. Right-click on the the *Local Fabric* configuration and select the *Export Connection Profile* option.
4. Save the file *local_fabric_connection.json* in the *back-end* folder of the project
5. Open the *back-end/config.json* file 
6. Make sure that the connectionProfile value is pointing to to point to "./local_fabric_connection.json"

### Predefined Network

1. Open the *back-end/config.json* file 
2. Make sure that the connectionProfile value is pointing to "../network/base/connection-org1.json"

### Generating the required certificates and genesis block

TODO: Describe Configuration

### Starting the Network and Deploying the Chaincode

1. Go to the folder *network/cargoguard
2. Execute the script `./startFabric.sh`

It will take around two minutes to execute the script, depending on the computer configuration.

The script will start :

* four peers with their respective couchdb databases
* two certificate athorities
* one orderer 
* one client

Also the script will create a channel, join peers to the channel, and deploy and initialise the chaincode to all peers.

### Starting the REST API

1. Open the terminal
2. Go to the folder *back-end
3. Install the libraries using the command `npm install`
4. Execute the command `npm start`

It will start a server running on port 8080

The following link contains examples of calls (initialising ledger, starting and finishing shipments, registering events, etc.)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/c59d0ad220dd1c2f622c)

### Starting the Front-end
