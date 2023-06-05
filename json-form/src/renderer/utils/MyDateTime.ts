export const allOffsets = [
  'Z',
  '+01:00',
  '+02:00',
  '+03:00',
  '+04:00',
  '+04:30',
  '+05:00',
  '+05:30',
  '+05:45',
  '+06:00',
  '+06:30',
  '+07:00',
  '+08:00',
  '+08:45',
  '+09:00',
  '+09:30',
  '+10:00',
  '+10:30',
  '+11:00',
  '+12:00',
  '+12:45',
  '+13:00',
  '+14:00',
  '-01:00',
  '-02:00',
  '-02:30',
  '-03:00',
  '-04:00',
  '-05:00',
  '-06:00',
  '-07:00',
  '-08:00',
  '-09:00',
  '-09:30',
  '-10:00',
  '-11:00',
  '-12:00',
];

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
