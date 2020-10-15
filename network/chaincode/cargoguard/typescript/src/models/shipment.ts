import { TransitStatusEnum } from '../enum/transit-status-enum';
import { State } from './state';

export class Shipment extends State {
    public id:string;
    public shipperId: string;
    public customerId: string;
    public creationTimestamp: string;
    public startTimestamp: string;
    public endTimestamp: string;
    public status: TransitStatusEnum;

    constructor(shipperId:string, customerId:string, creationTimestamp:string) {
        super('Shipment');
        this.shipperId = shipperId;
        this.customerId = customerId;
        this.creationTimestamp = creationTimestamp;
        // start with the created status
        this.status = TransitStatusEnum.CREATED;
        // creating id
        this.id = this.shipperId + '-' + this.customerId + '-' + creationTimestamp;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const shipment:Shipment = new Shipment(null,null,null);
        Object.assign(shipment,values);  
        return shipment;
    }

    getId():string {
        return this.id;
    }

}
