/*
 * Cargo Guard 
 */

import { Context, Contract } from 'fabric-contract-api';
import { Company } from './models/company';
import { Rule } from './models/rule';
import { SensorDataTypeEnum } from './enum/sensor-data-type-enum';
import { FreightContainer } from './models/freight-container';
import { Shipment } from './models/shipment';
import { TransitStatusEnum } from './enum/transit-status-enum';
import { ContainerEvent } from './models/container-event';
import { TransitAgreement } from './models/transit-agreement';

export class CargoGuard extends Contract {

    public async initLedger(ctx: Context) {
        
        // Creating Use Case Companies
        console.info('creating companies');
        await this.createCompany(ctx,'MAERSK','Maersk Line');
        await this.createCompany(ctx,'FISH-INC','Food Inc');

        // Creating Use Case Containers
        console.info('creating containers');
        await this.createContainer(ctx,'ML-1','ML',30);
        await this.createContainer(ctx,'ML-2','ML',30);
        await this.createContainer(ctx,'ML-3','ML',30);

        // Creating use case rules
        await this.createRule(ctx,'TEMPERATURE-FISH','Frozen fish condition - temperature',SensorDataTypeEnum.TEMPERATURE,'22','26');
        await this.createRule(ctx,'HUMIDITY-FISH','Frozen fish condition - humidity',SensorDataTypeEnum.HUMIDITY,'35','65');
        await this.createRule(ctx,'DOOR-FISH','Fish container should remain closed',SensorDataTypeEnum.DOOR,'0','0'); // value zero is 'door closed'

        const currentTimestamp = '1579202499405';

        // Creating Shipment
        console.info('creating shipments');
        await this.createShipment(ctx,'MAERSK','FISH-INC',currentTimestamp);

        // Add Transit Agreements (containers and rules)
        await this.addTransitAgreement(ctx,`MAERSK-FISH-INC-${currentTimestamp}-1`, `MAERSK-FISH-INC-${currentTimestamp}`, ['ML-1','ML-2','ML-3'], ['TEMPERATURE-FISH','HUMIDITY-FISH','DOOR-FISH']);

        return "ledger initialised";
    }

    /**
     * Create a company
     * 
     * @param ctx 
     * @param id company id
     * @param name company name
     */
    public async createCompany(ctx: Context, id:string, name: string) {

        // TODO: check if company already exists

        const company:Company = new Company(id, name);

        await ctx.stub.putState(company.getKey(), company.serialise());
    }

    /**
     * Create a shipment rule
     * 
     * @param ctx 
     * @param id 
     * @param description 
     * @param sensorDataType 
     * @param min 
     * @param max 
     */
    public async createRule(ctx: Context, id: string, description: string, sensorDataType: string, min: string, max:string) {

        const rule:Rule = new Rule(id,description,sensorDataType,parseFloat(min),parseFloat(max));

        // update world state
        await ctx.stub.putState(rule.getKey(), rule.serialise());
    }

    /**
     * Create a container
     * 
     * @param ctx 
     * @param id container id
     * @param ownerId owner id (company)
     * @param cubicSize capacity
     */
    public async createContainer(ctx: Context, id:string, ownerId: string, cubicSize: number) {

        // TODO: check if container already exists
        // TODO: check if owner is registered
        // TODO: check if cubic size is valid

        const container:FreightContainer = new FreightContainer(id,ownerId,cubicSize);

        await ctx.stub.putState(container.getKey(), container.serialise());
    }

    /**
     * Create a shipment
     * 
     * @param ctx 
     * @param shipperId 
     * @param customerId 
     * @param creationTimestamp 
     */
    public async createShipment(ctx: Context, shipperId:string, customerId:string, creationTimestamp:string) {

        // TODO: check if shipment already exists
        // TODO: check if shipper id is valid
        // TODO: check if customer id is valid
        // TODO: check if creation timestamp is valid

        const shipment: Shipment = new Shipment(shipperId, customerId, creationTimestamp);

        await ctx.stub.putState(shipment.getKey(), shipment.serialise());
    
    }

    /**
     * Add a container and agreed rules to the shipment
     * 
     * @param ctx 
     * @param shipmentId 
     * @param containerId 
     * @param cargoValue 
     * @param ruleIds 
     */
    public async addTransitAgreement(ctx: Context, id:string, shipmentId:string, containerIds:string[], ruleIds: string[]) {

        const ta: TransitAgreement = new TransitAgreement(id, shipmentId, containerIds, ruleIds);

        await ctx.stub.putState(ta.getKey(), ta.serialise());
    }

    /**
     * Start the trip 
     * 
     * @param ctx 
     * @param shipmentId 
     */
    public async startShipment(ctx: Context, shipmentId:string, startTimestamp:string) {

        // TODO: check if shipment status is created (if not, throw an error)

        // Get shipment from the keystore
        const buffer:Buffer = await ctx.stub.getState(shipmentId);

        // if shipment was not found
        if (!buffer || buffer.length == 0) {
            throw new Error(`Shipment ID ${shipmentId} not found`);
        }

        // get object from buffer
        let shipment:Shipment = Shipment.deserialise(buffer);

        // change the status to 'InTransit'
        shipment.status = TransitStatusEnum.INTRANSIT;
        shipment.startTimestamp = startTimestamp;

        // update world state
        await ctx.stub.putState(shipment.getKey(), shipment.serialise());

        return "shipment started";

    }

    /**
     * Register a sensor event
     * 
     * @param ctx 
     * @param containerId 
     * @param timestamp 
     * @param sensorDataType 
     * @param measuredVal 
     */
    public async registerEvent(ctx: Context, containerId:string, timestamp:string, sensorDataType:string, measuredVal:string) {

        const event:ContainerEvent = new ContainerEvent(containerId, timestamp, sensorDataType, parseFloat(measuredVal));

        // check if measurement affects any of the registered rules (can be optimised to consider only rules of active shipments)
        const rules = await this.queryRules(ctx);

        rules.forEach( rule => {
            if(event.sensorDataType === rule.sensorDataType && (event.measuredVal > rule.max || event.measuredVal < rule.min)) {
                event.irregularities.push(rule);
            }
        });

        // create a container event
        const contractEvent = {
                eventName: 'containerEventCreated',
                eventObj: event
        };

        ctx.stub.setEvent(contractEvent.eventName, Buffer.from(JSON.stringify(contractEvent)));
  
        // register the event in the ledger
        await ctx.stub.putState(event.getKey(), event.serialise());

        return "registered";
    }

    /**
     * End shipment (including quality assurance check per transit agreement)
     * 
     * @param ctx 
     * @param shipmentId 
     */
    public async endShipment(ctx: Context, shipmentId:string, endTimestamp:string) {

        // Get shipment from the keystore
        const buffer:Buffer = await ctx.stub.getState(shipmentId);

        // if shipment was not found
        if (!buffer || buffer.length == 0) {
            throw new Error(`Shipment ID ${shipmentId} not found`);
        }

        // get object from buffer
        let shipment:Shipment = Shipment.deserialise(buffer);

        // change the status to 'Arrived'
        shipment.status = TransitStatusEnum.ARRIVED;
        shipment.endTimestamp = endTimestamp;

        // get all agreements
        const agreements = await this.queryTransitAgreements(ctx,shipment.id);

        for( const agreement of agreements ) {
            
            // create an empty map of irregularities
            let irregularities = [];

            // get all containers of the agreement
            for( const containerId of agreement.containerIds ) {
                console.log('\tcontainerId',containerId);

                // get all events of the container
                const events = await this.queryEvents(ctx, containerId, shipment.startTimestamp,shipment.endTimestamp,null);

                for( const event of events ) {
                    console.log('\t\tevent ',event.id);
                
                    //get all irregularities of the event
                    for( const irr of event.irregularities ) {
                        // if irregularity is related to the shipment agreement
                        if( agreement.ruleIds.indexOf(irr.id) != -1) {
                            console.log(`rule ${irr.id} found in the agreement`);
                            if (!irregularities[containerId]) {
                                console.log(`irr map initialised for container ${containerId}`);
                                irregularities[containerId] = [];
                            }
                            // if irregularity is not yet registered for the container
                            if(irregularities[containerId].indexOf(irr.id) == -1) {
                                console.log(`added rule ${irr.id} to irr map of ${containerId}`);
                                irregularities[containerId].push(irr.id);
                            }
                        }
                    }
                }
            }

            console.log('final irregularities map',irregularities);

            agreement.irregularities = Object.assign({},irregularities);

            console.log('final agreement object: ', agreement);
            console.log('final agreement object (JSON)',JSON.stringify(agreement));
            console.log('final agreement object key: ',agreement.getKey());
            
            // update world state
            await ctx.stub.putState(agreement.getKey(), agreement.serialise());

        }

        // update world state
        await ctx.stub.putState(shipment.getKey(), shipment.serialise());

        return "shipment ended";

    }

    /**
     * Query rules
     */
    public async queryRules(ctx: Context) {

        // filtering only packed eggboxes, limited to max
        let queryString = {
            selector: {
                docType: 'Rule'
            }
        };

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        let allResults = [];

        for(;;) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                const ruleObject = JSON.parse(res.value.value.toString('utf8'));
                allResults.push(ruleObject);
            }

            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        return allResults;
    }

    /**
     * Query rule
     */
    public async queryRule(ctx: Context, id:string) {

        const buffer = await ctx.stub.getState('Rule-'+id);

        // if rule was not found
        if (!buffer || buffer.length == 0) {
            return null;
        }
  
        // get object from buffer
        const rule = Rule.deserialise(buffer);

        return rule;
    }

    /**
     * Query Shipments
     */
    public async queryShipments(ctx: Context) {

        // filtering only Shipments
        let queryString = {
            selector: {
                docType: 'Shipment'
            }
        };

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        let allResults = [];

        for(;;) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                const shipment:Shipment = Shipment.deserialise(res.value.value.toString('utf8'));
                allResults.push(shipment);
            }

            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }

        return allResults;
    }    

    /**
     * Query Transit Agreements
     */
    public async queryTransitAgreements(ctx: Context, shipmentId: string) {

        // filtering only agreements of shipment
        let queryString = {
            selector: {
                docType: 'ShipmentContainer',
                shipmentId: shipmentId
            }
        };

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        let allResults = [];

        for(;;) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                const agreement:TransitAgreement = TransitAgreement.deserialise(res.value.value.toString('utf8'));
                allResults.push(agreement);
            }

            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        return allResults;
    }
    
    /**
     * Query Events
     */
    public async queryEvents(ctx: Context, containerId:string, startTimestamp:string,endTimestamp:string, sensorDataType: string) {

        // filtering only events of the container in a certain period
        let queryString = {
            selector: {
                docType: 'ContainerEvent',
                containerId: `FreightContainer-${containerId}`,
                timestamp: { $gte : startTimestamp, $lte : endTimestamp }
            }
        };

        if(sensorDataType) {
            queryString.selector['sensorDataType'] = sensorDataType;
        }

        console.log('queryString',queryString);

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        let allResults = [];

        for(;;) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                const event = JSON.parse(res.value.value.toString('utf8'));
                allResults.push(event);
            }

            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        return allResults;
    }    


}