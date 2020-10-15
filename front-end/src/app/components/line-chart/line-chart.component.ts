import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Color, Label, BaseChartDirective } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';
import { EventService } from 'src/app/services/event.service';


@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  private _containerId: string;

  @Input('container') containerId:string;
  @Input('sensor') sensorDataType:string;

  @Input() min:number;
  @Input() max:number;

  maxSize:number = 15;

  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';  

  lineChartData: ChartDataSets[];
  lineChartLabels: Label[] = [];

  lineChartOptions = {
    responsive: true
  };

  lineChartColors: Color[] = [
    { 
      // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',      
    },
    { 
      // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { 
      // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'

    }
  ];

  @ViewChild(BaseChartDirective,null) 
  chart: BaseChartDirective;

  constructor(private eventService:EventService) {
  }

  ngOnInit() {

    this.lineChartData = [
      { data: [], label: this.containerId, fill:false },
      { data: [], label: 'min' , fill:false},
      { data: [], label: 'max' , fill:false}
    ];

    for(let i=0;i<this.maxSize;i++) {
      this.lineChartData[1].data.push(this.min);
      this.lineChartData[2].data.push(this.max);
    }

    this.eventService.subject.subscribe(
      msg => {
        console.log('@LineChartComponent eventService new subject item',msg);

        console.log('this-containerId',this.containerId);
        console.log('this-sensorDataType',this.sensorDataType);
        console.log('msg.eventObj.containerId',msg.eventObj.containerId);
        console.log('msg.eventObj.sensorDataType',msg.eventObj.sensorDataType);

        if(this.containerId == msg.eventObj.containerId &&
           this.sensorDataType == msg.eventObj.sensorDataType) {
          console.log('measured value when event was received',msg.eventObj.measuredVal);
          this.lineChartData[0].data.push(msg.eventObj.measuredVal.toString());
          const evDate = new Date(parseInt(msg.eventObj.timestamp));
          this.lineChartLabels.push(evDate.getHours().toString() + ":" + evDate.getMinutes().toString() + ":" + evDate.getSeconds().toString()); 

          if(this.lineChartData[0].data.length > this.maxSize) {
            this.lineChartLabels.shift();
            this.lineChartData[0].data.shift();
            this.chart.chart.update();
          }

        }

      },
      err => console.log(err),
      () => console.log('complete')
    );    
  }





}
