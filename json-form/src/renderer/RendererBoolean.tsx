import {
  Renderer,
  RendererInitArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import { Cmd, just, Maybe, noCmd, nothing } from 'tea-cup-core';
import { JsonValue, jvBool } from '../JsonValue';
import * as React from 'react';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import { TFunction } from 'i18next';
import { WrapErrors } from './utils/WrapErrors';
import { Checkbox } from 'carbon-components-react';
import { JsPath } from '../JsPath';
import {
  rendererModelBase,
  RendererModelBase,
} from './utils/RendererModelBase';

export type Msg = { tag: 'value-changed'; value: boolean };

export interface Model extends RendererModelBase {
  readonly fieldValue: Maybe<boolean>;
}

export const RendererBoolean: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const model: Model = {
      ...rendererModelBase(args),
      fieldValue:
        args.value.tag === 'jv-boolean' ? just(args.value.value) : nothing,
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
        return [newModel, Cmd.none(), just(jvBool(msg.value))];
      }
    }
  },
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model } = args;
    return args.model.fieldValue
      .map((value) => (
        <ViewBoolean
          errors={model.errors}
          t={args.t}
          path={model.path}
          checked={value}
          disabled={false}
          onChange={() => {
            args.dispatch({ tag: 'value-changed', value: !value });
          }}
        />
      ))
      .withDefaultSupply(() => <p>Not a boolean !</p>);
  },
};

interface ViewBooleanProps {
  readonly errors: readonly JsValidationError[];
  readonly t: TFunction;
  readonly path: JsPath;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onChange: () => void;
}

function ViewBoolean(p: ViewBooleanProps): React.ReactElement {
  const { t, errors, path, checked, disabled, onChange } = p;
  return (
    <WrapErrors errors={errors}>
      <div className="checkbox-wrapper">
        <Checkbox
          labelText={t('booleanValueLabel', {
            path: path.format('.'),
          }).toString()}
          hideLabel={true}
          id={'input-' + path.format('_')}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </WrapErrors>
  );
}
