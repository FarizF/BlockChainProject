import { SensorTypeEnum } from "../enum/sensortypeenum";
import { SensorBoundary } from "../models/sensorboundary";

export class SensorBoundariesFactory {
    private static readonly standardBoundariesLookup: Map<SensorTypeEnum, SensorBoundary[]> = new Map([
        [SensorTypeEnum.TempHumidity, [
                new SensorBoundary("Temp", null, null),
                new SensorBoundary("Humidity", null, null)
            ]
        ],
        [SensorTypeEnum.TempGyro, [
                new SensorBoundary("Temp", null, null),
                new SensorBoundary("X-axis", null, null),
                new SensorBoundary("Y-axis", null, null),
                new SensorBoundary("Y-axis", null, null),
            ]
        ],
        [SensorTypeEnum.Proximity, [
                new SensorBoundary("DoorOpened", 0, 1),
            ]
        ],
    ])

    public static initBoundaries(sensorType?: SensorTypeEnum, customBoundaries?: SensorBoundary[]): Array<SensorBoundary> {
        if (!sensorType && !customBoundaries) throw new Error("Pass at least one of the possible arguments to InitBoundaries()");
        if (customBoundaries) {
            this.customBoundaries();
            return;
        } else {
            let boundaries: SensorBoundary[] = this.standardBoundariesLookup.get(sensorType);
            return boundaries;
        }
    }

    // TODO: Complete function for custom amount of SensorBoundaries
    private static customBoundaries() { }
}
