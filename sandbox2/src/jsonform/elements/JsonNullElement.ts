import { JvNull, jvNull } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';

export class JsonNullElement extends JsonValueElementBase<JvNull> {
  static TAG_NAME = 'json-null';

  static newInstance(): JsonNullElement {
    const e = document.createElement(
      JsonNullElement.TAG_NAME,
    ) as JsonNullElement;
    return e;
  }

  constructor() {
    super();
  }

  protected doRender(args: RendererArgs) {
    this.setAttribute('jf-path', args.path.format());
    this.textContent = 'null';
  }

  getValue(): JvNull {
    return jvNull;
  }
}
