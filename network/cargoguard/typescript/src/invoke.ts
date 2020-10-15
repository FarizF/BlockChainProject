/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileSystemWallet, Gateway } from 'fabric-network';
import * as path from 'path';

import { Company } from './models/company';
import { Rule } from './models/rule';
import { SensorBoundaries } from './models/sensorboundaries';
import { TransitAgreement } from './models/transitagreement';
import { FreightContainer } from './models/freightcontainer';

import { SensorTypeEnum } from './enum/sensortypeenum';
import { TransitStatusEnum } from './enum/transitstatusenum';


const ccpPath = path.resolve(__dirname, '..', '..', '..', 'base', 'connection-org1.json');

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cargoguard');

        const companyMaersk = new Company("MRSK", "Maersk");
        const companyUnilever = new Company("UNIL", "Unilever");
        const companyProcterGamble = new Company("PRGA", "Procter & Gamble");

        const rules: Rule[] = [
            {
                sensorType: SensorTypeEnum.TempHumidity,
                description: "Rules for temperature and humidity within container",
                fineMultiplier: .8,
                sensorBoundaries: new SensorBoundaries(SensorTypeEnum.TempHumidity)
            }
        ]

        const transitAgreement: TransitAgreement = {
            buyer: companyUnilever,
            seller: companyProcterGamble,
            cargoValue: 60000,
            rules: rules
        };

        const containers: FreightContainer[] = [
            {
                designation: 'MAERSK3',
                owner: companyMaersk,
                transitAgreement: transitAgreement,
                cubicSize: 30
            }, {
                designation: 'MAERSK4',
                owner: companyMaersk,
                transitAgreement: transitAgreement,
                cubicSize: 30
            }, {
                designation: 'MAERSK5',
                owner: companyMaersk,
                transitAgreement: transitAgreement,
                cubicSize: 30
            }, {
                designation: 'MAERSK6',
                owner: companyMaersk,
                transitAgreement: transitAgreement,
                cubicSize: 30
            }
        ];

        // Submit the specified transaction.
        // createShipment transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        await contract.submitTransaction('createShipment', 'MAERSK15', TransitStatusEnum.Created, JSON.stringify(containers), JSON.stringify(companyMaersk));
        console.log(`Transaction has been submitted`);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
