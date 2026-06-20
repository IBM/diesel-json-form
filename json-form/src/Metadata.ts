import { ValidationError, SchemaRenderer } from './SchemaService.js';

export interface Metadata {
  readonly errors: ReadonlyMap<string, ReadonlyArray<ValidationError>>;
  readonly comboBoxes: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly formats: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly propertiesToAdd: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly renderers: ReadonlyMap<string, SchemaRenderer>;
  readonly requiredProperties: ReadonlySet<string>;
}

export const emptyMetadata: Metadata = {
  errors: new Map(),
  comboBoxes: new Map(),
  formats: new Map(),
  propertiesToAdd: new Map(),
  renderers: new Map(),
  requiredProperties: new Set(),
};
