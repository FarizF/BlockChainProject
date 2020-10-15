import { SensorTypeEnum } from "../enum/sensortypeenum";
import { FreightContainer } from "./freightcontainer";
import { Shipment } from "./shipment";

export class ContainerEvent {
    public id: number;
    public sensor: SensorTypeEnum;
    public measuredVal: number;
    public shipment: Shipment;
    public container: FreightContainer;
}
