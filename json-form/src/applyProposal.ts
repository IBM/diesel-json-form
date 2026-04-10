import { just, maybeOf, nothing, Task } from 'tea-cup-fp';
import { getValueAt, JsonValue, mergeProperties } from './JsonValue';
import { SchemaService } from './SchemaService';
import { JsPath } from './JsPath';
import { proposeNested } from './proposeNested';

export function applyProposalTask(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
  proposal: JsonValue,
  proposalIndex: number,
): Task<Error, JsonValue> {
  switch (proposal.tag) {
    case 'jv-object': {
      return Task.fromPromise(() => {
        return proposeNested(schema, schemaService, root, path, 5);
      }).map((all) => {
        return getValueAt(root, path)
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
          .withDefault(proposal);
      });
    }
    default: {
      return Task.succeed(proposal);
    }
  }
}
