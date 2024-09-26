import { JvNull, jvNull } from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';

export class JsonNullElement
  extends HTMLElement
  implements JsonValueElement<JvNull>
{
  static TAG_NAME = 'json-null';

  static newInstance(args: RendererArgs): JsonNullElement {
    const e = document.createElement(
      JsonNullElement.TAG_NAME,
    ) as JsonNullElement;
    e.setAttribute('jf-path', args.path.format());
    e.render();
    return e;
  }

  constructor() {
    super();
  }

  private render() {
    this.textContent = 'null';
  }

  getValue(): JvNull {
    return jvNull;
  }
}
