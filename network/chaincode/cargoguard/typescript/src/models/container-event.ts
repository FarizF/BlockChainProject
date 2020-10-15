import { State } from './state';
import { Rule } from './rule';

export class ContainerEvent extends State {
    public id: string;
    public containerId: string;
    public timestamp: string;
    public sensorDataType: string;
    public measuredVal: number;
    public irregularities: Rule[] = [];

    constructor(containerId: string, timestamp: string, sensorDataType: string, measuredVal: number) {
        super('ContainerEvent');
        this.containerId = containerId;
        this.timestamp = timestamp;
        this.sensorDataType = sensorDataType;
        this.measuredVal = measuredVal;
        // building id
        this.id = this.containerId + '-' + this.sensorDataType + '-' + this.timestamp;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const event:ContainerEvent = new ContainerEvent(null, null, null, null);
        Object.assign(event,values);  
        return event;
    }

    getId():string {
        return this.id;
    }


}
