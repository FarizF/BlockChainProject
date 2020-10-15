import { Component, OnInit, ViewChild } from '@angular/core';
import { ShipmentService } from 'src/app/services/shipment.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @ViewChild('content',null) content: any;

  constructor(private service:ShipmentService) { }

  ngOnInit() {
  }

  initialiseLedger() {

    this.service.initialiseLedger().subscribe( (data) => {
      location.reload();
    }, (error) => {
      console.error(error);
    })

  }

}
