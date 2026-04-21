import {
  JsonValue,
  JsPath,
  ValidationError,
  isValidNumberLiteral,
} from '@diesel-parser/json-form';

export function computeInvalidNumberErrors(
  value: JsonValue,
  path: JsPath = JsPath.empty,
): Map<string, ValidationError[]> {
  switch (value.tag) {
    case 'jv-number': {
      if (!isValidNumberLiteral(value.value)) {
        const res: Map<string, ValidationError[]> = new Map();
        const p = path.format();
        res.set(p, [{ path: p, message: 'Invalid number' }]);
        return res;
      } else {
        return new Map();
      }
    }
    case 'jv-array': {
      const res: Map<string, ValidationError[]> = new Map();
      for (let elemIndex = 0; elemIndex < value.elems.length; elemIndex++) {
        const elemErrors = computeInvalidNumberErrors(
          value.elems[elemIndex],
          path.append(elemIndex),
        );
        for (const p of elemErrors.keys()) {
          const errs = elemErrors.get(p);
          if (errs) {
            res.set(p, errs);
          }
        }
      }
      return res;
    }
    case 'jv-object': {
      const res = new Map();
      value.properties.forEach((p) => {
        const propErrors = computeInvalidNumberErrors(
          p.value,
          path.append(p.name),
        );
        for (const p of propErrors.keys()) {
          res.set(p, propErrors.get(p));
        }
      });
      return res;
    }
    default: {
      return new Map();
    }
  }
}
