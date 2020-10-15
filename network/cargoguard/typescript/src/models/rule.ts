import { SensorTypeEnum } from "../enum/sensortypeenum";
import { SensorBoundaries } from "./sensorboundaries";
 
export class Rule {
    public docType?: string;
    public sensorType: SensorTypeEnum;
    public description: string;
    public fineMultiplier: number;
    public sensorBoundaries: SensorBoundaries;

    constructor(description: string, fineMultiplier: number) {
        this.description = description;
        this.fineMultiplier = fineMultiplier;
    }
}
