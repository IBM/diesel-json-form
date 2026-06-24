export abstract class HeaderElement extends HTMLElement {
  constructor() {
    super();
  }

  abstract setCounter(counter: number | undefined): void;
}
