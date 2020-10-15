import { State } from "./state";

export class FreightContainer extends State {
    public id:string;
    public ownerId:string;
    public cubicSize: number;

    constructor(id:string, ownerId:string, cubicSize:number) {
        super('FreightContainer');
        this.id = id;
        this.ownerId = ownerId;
        this.cubicSize = cubicSize;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const container:FreightContainer = new FreightContainer(null,null,null);
        Object.assign(container,values);  
        return container;
    }

    getId():string {
        return this.id;
    }

}

