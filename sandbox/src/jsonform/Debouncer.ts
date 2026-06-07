export class Debouncer {
  private _timeout: any;
  private _delay: number = 200;

  set delay(d: number) {
    this._delay = d;
  }

  get delay(): number {
    return this._delay;
  }

  debounce(f: () => void) {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      f();
      clearTimeout(this._timeout);
      delete this._timeout;
    }, this.delay);
  }

  close() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      delete this._timeout;
    }
  }
}
