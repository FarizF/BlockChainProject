/*
 * SPDX-License-Identifier: Apache-2.0
 */

export class Company {
    public docType?: string;
    public id: string;
    public name: string;

    constructor(id:string, name: string) {
        this.id = id;
        this.name = name
    }
}
