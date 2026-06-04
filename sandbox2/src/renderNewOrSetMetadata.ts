import { JsonValue, JsPath, Metadata } from '@diesel-parser/json-form';
import { RenderedElement } from './form2/RenderedElement';
import { getRendererKey, Renderer } from './form2/Renderer';

export function renderNewOrSetMetadata(
  elem: RenderedElement<JsonValue>,
  metadata: Metadata,
  path: JsPath,
  renderer: Renderer,
): RenderedElement<JsonValue> | undefined {
  const newKey = getRendererKey(elem.getType(), metadata, path);
  if (!elem.rendererKey!.equals(newKey)) {
    const value = elem.toValue();
    const newElem = renderer.render({
      value,
      metadata,
      path,
    });
    return newElem;
  } else {
    elem.setMetadata(metadata, path, renderer);
    return undefined;
  }
}
