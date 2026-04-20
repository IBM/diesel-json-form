import {
  isValidNumberLiteral,
  JsonValue,
  JsPath,
  ValidationError,
  ValidationResult,
} from '@diesel-parser/json-form';

export class ValidationData {
  static fromValidationResult(
    validationResult: ValidationResult,
  ): ValidationData {
    const errors = new Map();
    for (const e of validationResult.getErrors()) {
      let errsAtPath = errors.get(e.path);
      if (!errsAtPath) {
        errsAtPath = [];
        errors.set(e.path, errsAtPath);
      }
      errsAtPath.push(e);
    }
    return new ValidationData(errors);
  }

  static empty(): ValidationData {
    return new ValidationData(new Map());
  }

  constructor(private errors: Map<string, ValidationError[]>) {}

  getErrors(path: JsPath): ValidationError[] {
    const errs = this.errors.get(path.format());
    const res = errs === undefined ? [] : errs;
    return res;
  }

  setInvalidNumberErrors(invalidNumbers: Map<string, ValidationError[]>) {
    for (const path of invalidNumbers.keys()) {
      const errs = invalidNumbers.get(path) ?? [];
      this.errors.set(path, errs);
    }
  }
}

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
