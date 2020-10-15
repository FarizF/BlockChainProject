import { State } from "./state";

export class Company extends State {
    public id: string;
    public name: string;

    constructor(id:string, name: string) {
        super('Company');
        this.docType = 'Company';
        this.id = id;
        this.name = name
    }

    getId(): string {
        return this.id;
    }

}
