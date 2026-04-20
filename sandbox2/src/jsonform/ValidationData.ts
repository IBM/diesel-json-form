import {
  JsPath,
  ValidationError,
  ValidationResult,
} from '@diesel-parser/json-form';

export class ValidationData {
  private errors: Map<string, ValidationError[]>;

  constructor(readonly validationResult: ValidationResult) {
    this.errors = new Map();
    const errors = validationResult.getErrors();
    console.log('RVKB', errors);
    for (const e of errors) {
      let errsAtPath = this.errors.get(e.path);
      if (!errsAtPath) {
        errsAtPath = [];
        this.errors.set(e.path, errsAtPath);
      }
      errsAtPath.push(e);
    }
  }

  getErrors(path: JsPath): ValidationError[] {
    const errs = this.errors.get(path.format());
    return errs ?? [];
  }
}
