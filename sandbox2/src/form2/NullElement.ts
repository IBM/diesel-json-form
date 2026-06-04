import { JsPath, jvNull, JvNull } from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

export abstract class NullElement extends RenderedElement<JvNull> {
  getType(): 'jv-null' {
    return 'jv-null';
  }

  toValue(): JvNull {
    return jvNull;
  }
}
