export abstract class State {

    public docType:string;

    constructor(docType) {
        this.docType = docType;
    }

    abstract getId():string;

    getKey():string {
        return this.docType + '-' + this.getId();
    }
    
    serialise():Buffer {
        return Buffer.from(JSON.stringify(this));
    }     
}