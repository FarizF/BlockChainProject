import { TransitStatusEnum } from "../enum/transitstatusenum";
import { FreightContainer } from "./freightcontainer";
import { Company } from "./company";

export class Shipment {
    public docType?: string;
    public id: string;
    public statusEnumString: string;
    public containersJson: string;
    public shipperCompanyJson?: string;
    public eventJson?: string;
    private totalShipmentValue?: number = 0;

    constructor() {
        let containers: FreightContainer[] = JSON.parse(this.containersJson);

        if (!containers) {
            console.log("Shipment does not (yet) contain any containers, shipmentValue is 0");            
            return;
        }

        for (let container of containers) {
            this.totalShipmentValue += container.transitAgreement.cargoValue;
        }
    }
}
