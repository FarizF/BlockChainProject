import { Injectable } from '@angular/core';
import { webSocket } from "rxjs/webSocket";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  subject = null;

  constructor() { 
    this.subject = webSocket(environment.blockchainWebSocketAddress);

    let message = { events: ["containerEventCreated"]};
    this.subject.next(message);
  }
}
