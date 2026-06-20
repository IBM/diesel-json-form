import { MyTime } from './MyTime.js';

export class MyDateTime {
  readonly date: string;
  readonly time: MyTime;

  constructor(readonly dateTime: string) {
    this.date = '';
    this.time = new MyTime('');
    const sepIndex = dateTime.indexOf('T');
    if (sepIndex !== -1) {
      // separator found, extract date and time parts
      this.date = dateTime.substring(0, sepIndex);
      this.time = new MyTime(dateTime.substring(sepIndex + 1));
    }
  }

  setDate(date: string): MyDateTime {
    return new MyDateTime(date + 'T' + this.time.fullTime);
  }

  setTime(time: string): MyDateTime {
    return new MyDateTime(this.date + 'T' + time);
  }
}
