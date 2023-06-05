import {
  Renderer,
  RendererInitArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import { Cmd, just, Maybe, noCmd, nothing } from 'tea-cup-core';
import { JsonValue, JvNumber, jvNumber } from '../JsonValue';
import * as React from 'react';
import {
  rendererModelBase,
  RendererModelBase,
} from './utils/RendererModelBase';
import { JsPath } from '../JsPath';
import { TFunction } from 'i18next';
import { errorsToInvalidText } from './utils/WrapErrors';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import { TextInput } from 'carbon-components-react';

export type Msg = { tag: 'value-changed'; value: number };

export interface Model extends RendererModelBase {
  readonly fieldValue: Maybe<number>;
}

export const RendererNumber: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const model: Model = {
      ...rendererModelBase(args),
      fieldValue:
        args.value.tag === 'jv-number' ? just(args.value.value) : nothing,
    };
    return noCmd(model);
  },
  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    const { model, msg } = args;
    switch (msg.tag) {
      case 'value-changed': {
        const newModel: Model = {
          ...model,
          fieldValue: just(msg.value),
        };
        return [newModel, Cmd.none(), just(jvNumber(msg.value))];
      }
    }
  },
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model } = args;
    return model.fieldValue
      .map((value) => (
        <ViewNumber
          path={model.path}
          value={value}
          disabled={false}
          t={args.t}
          errors={model.errors}
          onChange={(newValue) =>
            args.dispatch({
              tag: 'value-changed',
              value: newValue,
            })
          }
        />
      ))
      .withDefaultSupply(() => <p>Not a string !</p>);
  },
};

interface ViewNumberProps {
  readonly path: JsPath;
  readonly value: number;
  readonly disabled: boolean;
  readonly t: TFunction;
  readonly errors: readonly JsValidationError[];
  readonly onChange: (value: number) => void;
}

function ViewNumber(p: ViewNumberProps): React.ReactElement {
  const { path, value, disabled, t, errors } = p;
  return (
    <TextInput
      labelText={t('numberValueLabel', { path: path.format('.') }).toString()}
      hideLabel={true}
      id={'input-' + path.format('_')}
      type="number"
      value={value}
      disabled={disabled}
      invalidText={errorsToInvalidText(errors)}
      invalid={errors.length > 0}
      onChange={(evt) => {
        const newValue = parseFloat(evt.target.value);
        if (newValue !== undefined && !isNaN(newValue)) {
          p.onChange(newValue);
        }
      }}
    />
  );
}
