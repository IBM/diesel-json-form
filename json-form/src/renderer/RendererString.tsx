import {
  Renderer,
  RendererInitArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import { Cmd, just, Maybe, noCmd, nothing } from 'tea-cup-core';
import { JsonValue, jvString, valueFromAny } from '../JsonValue';
import * as React from 'react';
import { JsPath } from '../JsPath';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import { TFunction } from 'i18next';
import { errorsToInvalidText } from './utils/WrapErrors';
import {
  ComboBox,
  DatePicker,
  DatePickerInput,
  SelectItem,
  TextInput,
  TimePicker,
  TimePickerSelect,
} from 'carbon-components-react';
import { allOffsets, MyDateTime, MyTime } from './utils/MyDateTime';

export type Msg = { tag: 'value-changed'; value: string };

export interface Model {
  readonly fieldValue: Maybe<string>;
  readonly path: JsPath;
  readonly proposals: readonly string[];
  readonly formats: readonly string[];
  readonly errors: readonly JsValidationError[];
}

export const RendererString: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const fmtPath = args.path.format();
    const proposals: string[] = args.validationResult
      .map((validationResult) =>
        validationResult.propose(fmtPath, 1).flatMap((p) => {
          const v = valueFromAny(p);
          return v.match(
            (v) => {
              if (v.tag === 'jv-string' && v.value !== '') {
                return [p];
              }
              return [];
            },
            () => [],
          );
        }),
      )
      .withDefault([]);

    const formats: readonly string[] = args.validationResult
      .map((validationResult) => validationResult.getFormats(fmtPath))
      .withDefault([]);

    const errors = args.validationResult
      .map((validationResult) => validationResult.getErrors(fmtPath))
      .withDefault([]);

    const model: Model = {
      fieldValue:
        args.value.tag === 'jv-string' ? just(args.value.value) : nothing,
      path: args.path,
      proposals,
      formats,
      errors,
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
        return [newModel, Cmd.none(), just(jvString(msg.value))];
      }
    }
  },
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model } = args;
    const { path, fieldValue, errors, formats, proposals } = model;
    const { t, dispatch } = args;
    return fieldValue
      .map((value) => (
        <ViewString
          formats={formats}
          proposals={proposals.filter((s) => s !== '')}
          path={path}
          errors={errors}
          value={value}
          t={t}
          disabled={false}
          onChange={(value) => dispatch({ tag: 'value-changed', value })}
        />
      ))
      .withDefaultSupply(() => <p>Not a string !</p>);
  },
};

interface ViewStringPropsBase {
  readonly path: JsPath;
  readonly errors: readonly JsValidationError[];
  readonly value: string;
  readonly t: TFunction;
  readonly disabled: boolean;
  readonly onChange: (value: string) => void;
}

function ViewStringDefault(p: ViewStringPropsBase): React.ReactElement {
  const { path, errors, t, value, disabled, onChange } = p;
  return (
    <TextInput
      labelText={t('stringValueLabel', { path: path.format('.') }).toString()}
      hideLabel={true}
      id={'input-' + path.format('_')}
      type="text"
      value={value}
      disabled={disabled}
      invalidText={errorsToInvalidText(errors)}
      invalid={errors.length > 0}
      placeholder={t('stringValuePlaceholder')}
      onChange={(evt) => {
        const newStr = evt.target.value;
        onChange(newStr);
      }}
    />
  );
}

interface ViewStringProps extends ViewStringPropsBase {
  readonly formats: readonly string[];
  readonly proposals: readonly string[];
}

function ViewString(p: ViewStringProps): React.ReactElement {
  const { formats, proposals } = p;
  if (formats.length === 0) {
    // no formats, check for proposals (enum, examples etc)
    if (proposals.length === 0) {
      return <ViewStringDefault {...p} />;
    } else {
      return <ViewStringWithCombo {...p} proposals={proposals} />;
    }
  } else {
    // we have formats !
    return <ViewStringWithFormats {...p} formats={formats} />;
  }
}

interface ViewStringWithComboProps extends ViewStringPropsBase {
  readonly proposals: ReadonlyArray<string>;
}

function ViewStringWithCombo(p: ViewStringWithComboProps): React.ReactElement {
  const { t, path, disabled, errors, proposals, value, onChange } = p;
  return (
    <ComboBox
      id={'input-' + p.path.format('_')}
      ariaLabel={t('stringValueComboLabel', {
        path: path.format('.'),
      }).toString()}
      disabled={disabled}
      invalidText={errorsToInvalidText(errors)}
      invalid={errors.length > 0}
      items={proposals}
      value={value}
      selectedItem={value}
      placeholder={''}
      onChange={(item) => onChange(item.selectedItem ?? '')}
    />
  );
}

function MyTimePicker(props: ViewStringPropsBase) {
  const { path, onChange, value, t, errors } = props;
  const fmtPath = path.format('_');
  return (
    <TimePicker
      id={'time-picker-' + fmtPath}
      className={'time-picker'}
      onChange={(e) => {
        const t = new MyTime(value);
        const replaced = t.setTime(e.target.value);
        onChange(replaced.fullTime);
      }}
      pattern="([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d(\.(\d{1,3}))?)?"
      maxLength={12}
      invalidText={errorsToInvalidText(errors)}
      invalid={errors.length > 0}
      value={new MyTime(value).time}
    >
      <div className={'time-picker-offset-wrapper'}>
        <TimePickerSelect
          id={'time-picker-select' + fmtPath}
          aria-label={t('timeValueLabel', {
            path: props.path.format('.'),
          }).toString()}
          labelText={''}
          onChange={(event) => {
            const offset = event.target.value;
            const t = new MyTime(value);
            onChange(t.setOffset(offset).fullTime);
          }}
          value={new MyTime(value).offset}
        >
          {[<SelectItem key={'default'} text={''} value={''} />].concat(
            allOffsets.map((offset) => (
              <SelectItem key={offset} value={offset} text={offset} />
            )),
          )}
        </TimePickerSelect>
      </div>
    </TimePicker>
  );
}

function MyDatePicker(props: ViewStringPropsBase) {
  const { t, errors, path } = props;
  const fmtPath = path.format('_');
  return (
    <DatePicker
      id={'date-picker-' + fmtPath}
      datePickerType="single"
      dateFormat={'Y-m-d'}
      onChange={(dates, str) => {
        props.onChange(str);
      }}
      value={props.value}
    >
      <DatePickerInput
        id={'input-' + fmtPath}
        aria-label={t('dateValueLabel', {
          path: props.path.format('.'),
        }).toString()}
        labelText={''}
        hideLabel={true}
        autoComplete={'off'}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        invalidText={errorsToInvalidText(errors)}
        invalid={errors.length > 0}
      />
    </DatePicker>
  );
}

interface ViewStringWithFormatsProps extends ViewStringPropsBase {
  readonly formats: ReadonlyArray<string>;
}

function ViewStringWithFormats(
  p: ViewStringWithFormatsProps,
): React.ReactElement {
  const { formats } = p;
  switch (formats.length) {
    case 0:
      return <ViewStringDefault {...p} />;
    case 1: {
      const format = formats[0];
      switch (format) {
        case 'date': {
          return (
            <MyDatePicker
              path={p.path}
              value={p.value}
              onChange={p.onChange}
              errors={p.errors}
              t={p.t}
              disabled={p.disabled}
            />
          );
        }
        case 'date-time': {
          const dt = new MyDateTime(p.value);
          return (
            <div className={'date-time-picker'}>
              <div className={'date-time-picker__date'}>
                <MyDatePicker
                  path={p.path}
                  value={dt.date}
                  onChange={(s) => {
                    const dt2 = dt.setDate(s);
                    p.onChange(dt2.dateTime);
                  }}
                  errors={p.errors}
                  t={p.t}
                  disabled={p.disabled}
                />
              </div>
              <div className={'date-time-picker__time'}>
                <MyTimePicker
                  path={p.path}
                  onChange={(s) => {
                    const dt2 = dt.setTime(s);
                    p.onChange(dt2.dateTime);
                  }}
                  value={dt.time.fullTime}
                  errors={p.errors}
                  t={p.t}
                  disabled={p.disabled}
                />
              </div>
            </div>
          );
        }
        case 'time': {
          return (
            <MyTimePicker
              path={p.path}
              onChange={p.onChange}
              value={p.value}
              errors={p.errors}
              t={p.t}
              disabled={p.disabled}
            />
          );
        }
        default:
          return <ViewStringDefault {...p} />;
      }
    }
    default: {
      return <ViewStringDefault {...p} />;
    }
  }
}
