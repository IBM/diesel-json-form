import {
  getValueAt,
  JsonValue,
  JsPath,
  mergeProperties,
  proposeNested,
  SchemaService,
} from '@diesel-parser/json-form';
import { just, maybeOf, nothing } from 'tea-cup-fp';

export async function augmentProposal(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
  proposal: JsonValue,
  proposalIndex: number,
): Promise<JsonValue> {
  if (proposal.tag === 'jv-object') {
    return proposeNested(schema, schemaService, root, path, 5).then((all) =>
      getValueAt(root, path)
        .map((valueAtPath) => {
          const augmentedProposal = maybeOf(all[proposalIndex])
            .andThen((v) => (v.tag === 'jv-object' ? just(v) : nothing))
            .withDefault(proposal);

          if (valueAtPath.tag === 'jv-object') {
            // do not overwrite existing props
            return mergeProperties(augmentedProposal, valueAtPath);
          } else {
            return augmentedProposal;
          }
        })
        .withDefault(proposal),
    );
  } else {
    return Promise.resolve(proposal);
  }
}
