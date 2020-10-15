import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Shipment } from '../model/shipment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  constructor(private httpClient: HttpClient) { }

  getShipments() {

    return this.httpClient.get<Shipment[]>(environment.blockchainRestClientAddress + '/rest/shipments');
  }

  startShipment(id:string, startTimestamp:string) {

    id = 'Shipment-' + id;

    return this.httpClient.post(environment.blockchainRestClientAddress + `/rest/shipments/${id}/start`, { startTimestamp:startTimestamp});
  }

  stopShipment(id:string, endTimestamp:string) {

    id = 'Shipment-' + id;

    return this.httpClient.post(environment.blockchainRestClientAddress + `/rest/shipments/${id}/end`, { endTimestamp:endTimestamp});
  }

  getAgreements(id:string) {    
    return this.httpClient.get<Object[]>(environment.blockchainRestClientAddress + `/rest/shipments/${id}/transit-agreements`);
  }

  initialiseLedger() {

    return this.httpClient.post(environment.blockchainRestClientAddress + '/rest/ledger',null);
  }  



}
