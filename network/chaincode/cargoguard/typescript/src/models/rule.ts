import { State } from './state';
 
export class Rule extends State {
    public id: string;
    public description: string;
    public sensorDataType: string;
    public min:number;
    public max:number;

    /**
     * 
     * @param id 
     * @param description 
     * @param sensorDataType TEMPERATURE, HUMIDITY, GYRO, DOOR
     * @param min 
     * @param max 
     */
    constructor(id:string, description:string, sensorDataType:string, min:number, max:number) {
        super('Rule');
        this.id = id;
        this.description = description;
        this.sensorDataType = sensorDataType;
        this.min = min;
        this.max = max;
    }

    getId():string {
        return this.id;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer:Buffer) {
        const values = JSON.parse(buffer.toString());
        const rule:Rule = new Rule(null,null,null,null,null);
        Object.assign(rule,values);  
        return rule;
    }
    

}
