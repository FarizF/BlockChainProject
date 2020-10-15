import { State } from './state'

export class TransitAgreement extends State {
    public id: string;
    public shipmentId: string;
    public containerIds: string[];
    public ruleIds: string[];
    public irregularities: string[];

    constructor(id:string, shipmentId:string, containerIds:string[], ruleIds: string[]) {
        super('ShipmentContainer');
        this.id = id;
        this.shipmentId = shipmentId;
        this.containerIds = containerIds;
        this.ruleIds = ruleIds;
        this.irregularities = [];
    }
 
    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const agreement:TransitAgreement = new TransitAgreement(null,null,null,null);
        Object.assign(agreement,values);  
        return agreement;
    }

    serialise() {
        return Buffer.from(JSON.stringify(this));
    }     

    getId():string {
        return this.id;
    }

}