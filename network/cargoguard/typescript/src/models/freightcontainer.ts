import { Company } from "./company";
import { TransitAgreement } from "./transitagreement";
import { ContainerEvent } from "./containerevent";

 
export class FreightContainer {
    public designation: string;
    public owner: Company;
    public transitAgreement: TransitAgreement;
    public cubicSize?: number;
    public events?: ContainerEvent[];
}

