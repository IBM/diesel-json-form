import { Cmd, Task } from 'tea-cup-fp';
import { gotMetadata, Msg } from './Msg';
import { Metadata } from './Metadata';
import { SchemaService, ValidationResult } from './SchemaService';
import { getValueAt, JsonValue } from './JsonValue';
import { JsPath } from './JsPath';
import { Model, nextPendingId } from './Model';

function computeAllTask(
  schemaService: SchemaService,
  schema: JsonValue,
  value: JsonValue,
): Task<Error, Metadata> {
  return Task.fromPromise(() => {
    return validateAndComputeMetadata(schemaService, schema, value);
  });
}

export async function validateAndComputeMetadata(
  schemaService: SchemaService,
  schema: JsonValue,
  value: JsonValue,
): Promise<Metadata> {
  return schemaService
    .validate(schema, value)
    .then(async (validationResult) => {
      const errors = new Map();
      validationResult.getErrors().forEach((err) => {
        const errsAtPath = errors.get(err.path);
        if (errsAtPath) {
          errors.set(err.path, [...errsAtPath, err]);
        } else {
          errors.set(err.path, [err]);
        }
      });
      const propertiesToAdd = new Map<string, ReadonlyArray<string>>();
      await doComputePropsToAdd(
        schemaService,
        schema,
        value,
        validationResult,
        propertiesToAdd,
      );
      const comboBoxes = new Map<string, ReadonlyArray<string>>();
      const formats = new Map<string, ReadonlyArray<string>>();
      await doComputeStringsMetadata(
        schemaService,
        schema,
        value,
        validationResult,
        comboBoxes,
        formats,
      );
      const res: Metadata = {
        errors,
        comboBoxes,
        formats,
        propertiesToAdd,
        renderers: validationResult.getRenderers(),
      };
      return res;
    });
}

export function computeAllCmd(
  model: Model,
  schemaService: SchemaService,
  schema: JsonValue,
  value: JsonValue,
): [Model, Cmd<Msg>] {
  const [newModel, newPendingId] = nextPendingId(model, 'got-metadata');
  const cmd = Task.attempt(
    computeAllTask(schemaService, schema, value),
    gotMetadata(newPendingId),
  );
  return [newModel, cmd];
}

async function doComputePropsToAdd(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  validationResult: ValidationResult,
  props: Map<string, ReadonlyArray<string>>,
  path: JsPath = JsPath.empty,
): Promise<void> {
  const v = getValueAt(root, path);
  if (v.type === 'Just') {
    const value = v.value;
    switch (value.tag) {
      case 'jv-object': {
        // compute props for this object and recurse
        const existingPropertyNames = new Set(
          value.properties.map((p) => p.name),
        );
        const attrNames = new Set();
        const proposed = await schemaService.propose(schema, root, path);
        const propNameProposals: string[] = proposed.flatMap((proposal) => {
          if (proposal.tag === 'jv-object') {
            const objAttrs = proposal.properties.map((p) => p.name);
            const res = [];
            for (const name of objAttrs) {
              if (!existingPropertyNames.has(name) && !attrNames.has(name)) {
                attrNames.add(name);
                res.push(name);
              }
            }
            return res;
          }
          return [];
        });

        const d = validationResult.getDiscriminator(path);
        if (d && attrNames.has(d)) {
          props.set(path.format(), [d]);
        } else {
          props.set(path.format(), propNameProposals);
          for (const prop of value.properties) {
            await doComputePropsToAdd(
              schemaService,
              schema,
              root,
              validationResult,
              props,
              path.append(prop.name),
            );
          }
        }
        break;
      }
      case 'jv-array': {
        // recurse
        for (let elemIndex = 0; elemIndex < value.elems.length; elemIndex++) {
          await doComputePropsToAdd(
            schemaService,
            schema,
            root,
            validationResult,
            props,
            path.append(elemIndex),
          );
        }
        break;
      }
    }
  }
}

async function doComputeStringsMetadata(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  validationResult: ValidationResult,
  comboBoxes: Map<string, ReadonlyArray<string>>,
  formats: Map<string, ReadonlyArray<string>>,
  path: JsPath = JsPath.empty,
): Promise<void> {
  const v = getValueAt(root, path);
  if (v.type === 'Just') {
    const value = v.value;
    switch (value.tag) {
      case 'jv-object': {
        for (const prop of value.properties) {
          await doComputeStringsMetadata(
            schemaService,
            schema,
            root,
            validationResult,
            comboBoxes,
            formats,
            path.append(prop.name),
          );
        }
        break;
      }
      case 'jv-array': {
        // recurse
        for (let elemIndex = 0; elemIndex < value.elems.length; elemIndex++) {
          await doComputeStringsMetadata(
            schemaService,
            schema,
            root,
            validationResult,
            comboBoxes,
            formats,
            path.append(elemIndex),
          );
        }
        break;
      }
      case 'jv-string': {
        const p = await schemaService.propose(schema, root, path);
        const proposals = p
          .flatMap((proposal) => {
            if (proposal.tag === 'jv-string') {
              return [proposal.value];
            } else {
              return [];
            }
          })
          .filter((s) => s !== '');

        if (proposals.length > 0) {
          comboBoxes.set(path.format(), proposals);
        }

        const fmts: ReadonlyArray<string> = validationResult.getFormats(path);
        if (fmts.length > 0) {
          formats.set(path.format(), fmts);
        }
        break;
      }
    }
  }
}
