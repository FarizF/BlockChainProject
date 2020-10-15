import { Component, OnInit } from '@angular/core';
import { ShipmentService } from 'src/app/services/shipment.service';
import { Shipment } from 'src/app/model/shipment';

@Component({
  selector: 'app-shipments',
  templateUrl: './shipments.component.html',
  styleUrls: ['./shipments.component.css']
})
export class ShipmentsComponent implements OnInit {

  constructor(private service: ShipmentService) { }

  shipments: Shipment[];
  irregularities = [];

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getShipments().subscribe((data) => {
      this.shipments = data;
    }, (error) => {
      console.error(error);
    });

  }

  startShipment(id:string, position:number) {
    const startTimestamp = Date.now().toString();
    this.service.startShipment(id,startTimestamp).subscribe( (data) => {
      console.log(data);
      this.shipments[position].status = "INTRANSIT";
      this.shipments[position].startTimestamp = startTimestamp;
    }, (error) => {
      console.error(error);
    })
  }

  endShipment(id:string, position:number) {
    const endTimestamp = Date.now().toString();
    this.service.stopShipment(id,endTimestamp).subscribe( (data) => {
      console.log(data);
      this.shipments[position].status = "ARRIVED";
      this.shipments[position].endTimestamp = endTimestamp;
    }, (error) => {
      console.error(error);
    })
  }

  getQualityAssuranceInformation(id:string) {

    this.irregularities = [];
    this.service.getAgreements(id).subscribe( (data) => {

      for(let i=0;i<data.length;i++) {
        if(JSON.stringify(data[i]['irregularities']) != "{}")
          this.irregularities = this.irregularities.concat(data[i]['irregularities']);
      }
      console.log(this.irregularities);
    }, (error) => {
      console.error(error);
    });


  }



}
