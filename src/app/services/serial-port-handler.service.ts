import { Injectable } from '@angular/core';
import {
  CHARACHORDER_LITE_DEVICE_PORTS,
  SerialPortHandler,
} from 'tangent-cc-lib';

@Injectable({ providedIn: 'root' })
export class SerialPortHandlerService extends SerialPortHandler {
  constructor() {
    super(false, CHARACHORDER_LITE_DEVICE_PORTS);
  }
}
