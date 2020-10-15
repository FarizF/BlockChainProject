import { Company } from "./company";
import { FreightContainer } from "./freightcontainer";
import { SensorTypeEnum } from "../enum/sensortypeenum";

export class Event {
    public id: number;
    public sensor: SensorTypeEnum;
    public measuredVal: number;
    public shipment: Company;
    public container: FreightContainer;
}
