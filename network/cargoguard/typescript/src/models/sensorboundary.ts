export class SensorBoundary {
    public name: string;
    public min?: number;
    public max?: number;

    constructor(name: string, min: number, max: number) {
        if (min && max) throw new Error("min and max cannot both be null!");

        this.name = name;
        if (min) this.min = min;
        if (max) this.max = max;
    }
}
