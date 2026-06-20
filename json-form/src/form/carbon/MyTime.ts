import { allOffsets } from './allOffsets.js';

export class MyTime {
  readonly time: string;
  readonly offset: string;

  constructor(readonly fullTime: string) {
    this.time = fullTime;
    this.offset = '';
    for (let i = 0; i < allOffsets.length; i++) {
      const offset = allOffsets[i];
      if (fullTime.endsWith(offset)) {
        this.time = fullTime.substring(0, fullTime.length - offset.length);
        this.offset = offset;
        break;
      }
    }
  }

  setTime(time: string): MyTime {
    return new MyTime(time + this.offset);
  }

  setOffset(offset: string): MyTime {
    return new MyTime(this.time + offset);
  }
}
