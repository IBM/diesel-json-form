/*
 * Copyright 2018 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import {
  Button,
  Checkbox,
  ComboBox,
  DatePicker,
  DatePickerInput,
  SelectItem,
  Tag,
  TextInput,
  TimePicker,
  TimePickerSelect,
} from 'carbon-components-react';
import * as React from 'react';
import { Cmd, Dispatcher, Maybe, maybeOf } from 'tea-cup-core';
import { box, Dim, pos } from 'tea-pop-core';
import {
  JsonValue,
  JvArray,
  JvBoolean,
  JvNull,
  JvNumber,
  JvObject,
  jvString,
  JvString,
} from '../JsonValue';
import { JsPath } from '../JsPath';
import { CustomRendererModel, Model as FormModel } from '../Model';
import { Msg } from '../Msg';

import Add16 from '@carbon/icons-react/lib/add/16';
import ChevronDown16 from '@carbon/icons-react/lib/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/lib/chevron--up/16';
import OverflowMenuVertical16 from '@carbon/icons-react/lib/overflow-menu--vertical/16';
import { TFunction } from 'i18next';
import { ViewValueProps } from './ViewValueProps';
import { RenderOptions } from '../RenderOptions';

export interface RendererInitArgs<Model> {
  readonly path: JsPath;
  readonly formModel: FormModel;
  readonly value: JsonValue;
  readonly model: Maybe<Model>;
  readonly schema: any;
}

export interface RendererViewArgs<Model, Msg> {
  readonly dispatch: Dispatcher<Msg>;
  readonly model: Model;
  readonly path: JsPath;
  readonly formView: (path: JsPath, value: JsonValue) => React.ReactElement;
}

export interface Renderer<Model, Msg> {
  reinit(args: RendererInitArgs<Model>): [Model, Cmd<Msg>];
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement;
  update(msg: Msg, model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>];
}

export class RendererFactory {
  private renderers: Map<string, Renderer<any, any>> = new Map();

  addRenderer<Model, Msg>(key: string, renderer: Renderer<Model, Msg>) {
    this.renderers.set(key, renderer);
  }

  getRenderer<Model, Msg>(key: string): Maybe<Renderer<Model, Msg>> {
    const renderer = this.renderers.get(key);
    return maybeOf(renderer as Renderer<Model, Msg>);
  }
}

export function ViewJsonValue(
  p: ViewValueProps<JsonValue>,
): React.ReactElement {
  const { value, rendererFactory, renderOptions } = p;

  const path = p.path.format();
  if (rendererFactory) {
    const customRendererModel = p.model.customRenderers.get(path);
    if (customRendererModel && customRendererModel.type === 'Just') {
      const m: CustomRendererModel = customRendererModel.value;
      const renderer = rendererFactory.getRenderer(m.key);
      if (renderer.type === 'Just') {
        return renderer.value.view({
          dispatch: (msg: any) =>
            p.dispatch({
              tag: 'renderer-child-msg',
              path,
              msg,
            }),
          model: m.rendererModel,
          path: p.path,
          formView: (path: JsPath, value: JsonValue) => (
            <ViewJsonValue
              model={p.model}
              path={path}
              value={value}
              dispatch={p.dispatch}
              rendererFactory={rendererFactory}
              language={p.language}
            />
          ),
          renderOptions: renderOptions,
        });
      }
    }
  }

  const content = () => {
    switch (value.tag) {
      case 'jv-array':
        return <ViewArray {...p} value={value} />;
      case 'jv-object':
        return <ViewObject {...p} value={value} />;
      case 'jv-boolean':
        return <ViewBoolean {...p} value={value} />;
      case 'jv-null':
        return <ViewNull {...p} value={value} />;
      case 'jv-number':
        return <ViewNumber {...p} value={value} />;
      case 'jv-string':
        return <ViewString {...p} value={value} />;
    }
  };
  return (
    <div className={'value'} data-path={p.path.format()}>
      {content()}
    </div>
  );
}

function ViewObject(p: ViewValueProps<JvObject>): React.ReactElement {
  const { model, value, dispatch, path, renderOptions } = p;
  const { properties } = value;
  const { t } = model;

  const isAddingProp = p.model.adding.isJust();

  let addSection = <></>;
  model.adding.forEach((addingState) => {
    // are we owning ?
    const { ownerPath } = addingState;
    if (path.equals(ownerPath)) {
      addSection = (
        <div className="add-prop-form">
          <TextInput
            labelText={t('propertyNameLabel', {
              path: path.format('.'),
            }).toString()}
            hideLabel={true}
            id={'property-name-editor'}
            placeholder={t('propertyNamePlaceholder')}
            value={addingState.addingPropName}
            onChange={(e) =>
              dispatch({
                tag: 'new-property-name-changed',
                value: e.target.value,
              })
            }
            onKeyDown={(e) => {
              dispatch({
                tag: 'new-property-name-key-down',
                key: e.key,
              });
            }}
            invalidText={t<string>('propertyAlreadyExists')}
            invalid={addingState.isDuplicate}
          />
          <div className={'buttons-row'}>
            <div className="spacer" />
            <Button
              kind={'primary'}
              disabled={
                addingState.addingPropName === '' || addingState.isDuplicate
              }
              onClick={() =>
                dispatch({ tag: 'add-prop-ok-cancel-clicked', ok: true })
              }
            >
              Add
            </Button>
            <Button
              kind={'secondary'}
              onClick={() =>
                dispatch({ tag: 'add-prop-ok-cancel-clicked', ok: false })
              }
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
  });

  const addingOwnerPath = model.adding.map((a) => a.ownerPath);

  const existingPropertyNames = new Set(properties.map((p) => p.name));

  return (
    <div className="jv-object">
      {properties.length === 0 ? (
        <div className="empty-obj">{t('emptyObject')}</div>
      ) : (
        <></>
      )}
      {properties.map((prop, propIndex) => {
        const propertyPath = p.path.append(prop.name);
        const disabled =
          isAddingProp &&
          addingOwnerPath
            .map((ownerPath) => {
              return !propertyPath.isParentOf(ownerPath);
            })
            .withDefault(false);
        const propNameClass = ['object-prop'].concat(
          disabled ? ['disabled'] : [''],
        );
        const isCollapsed = model.collapsedPaths.has(propertyPath.format());
        return (
          <div className={propNameClass.join(' ')} key={prop.name + propIndex}>
            <div className={'prop-name-row'}>
              {!renderOptions?.hideCollapsiblePanel && (
                <div className="prop-expand">
                  <ExpandCollapseButton
                    collapsed={isCollapsed}
                    dispatch={dispatch}
                    path={propertyPath}
                    t={t}
                  />
                </div>
              )}
              <div className={'prop-name'}>{prop.name}</div>
              <ArrayCounter value={prop.value} />
              <div className={'prop-menu'}>
                <MenuTrigger
                  dispatch={dispatch}
                  path={propertyPath}
                  disabled={isAddingProp}
                  t={t}
                  renderOptions={renderOptions}
                />
              </div>
            </div>
            {isCollapsed ? (
              <></>
            ) : (
              <div className="prop-value">
                <ViewJsonValue
                  {...p}
                  path={propertyPath}
                  value={prop.value}
                  renderOptions={renderOptions}
                />
              </div>
            )}
          </div>
        );
      })}
      <ViewErrors errors={getErrorsAtPath(p)} />
      <div>{addSection}</div>
      <div>
        {maybeOf(model.propertiesToAdd.get(p.path.format()))
          .map((propNames) => (
            <>
              {propNames
                .filter((propName) => !existingPropertyNames.has(propName))
                .sort()
                .map((propName) => (
                  <div className="add-prop-row" key={propName}>
                    <Button
                      renderIcon={Add16}
                      kind={'ghost'}
                      onClick={() =>
                        dispatch({
                          tag: 'add-property-btn-clicked',
                          path: p.path,
                          propertyName: propName,
                        })
                      }
                    >
                      {propName}
                    </Button>
                  </div>
                ))}
            </>
          ))
          .withDefault(<></>)}
      </div>
    </div>
  );
}

export interface ArrayCounterProps {
  readonly value: JsonValue;
}

export function ArrayCounter(props: ArrayCounterProps) {
  if (props.value.tag === 'jv-array') {
    return (
      <div className="array-counter">
        <Tag>{props.value.elems.length}</Tag>
      </div>
    );
  }
  return <></>;
}

interface ExpandCollapseButtonProps {
  readonly collapsed: boolean;
  readonly dispatch: Dispatcher<Msg>;
  readonly path: JsPath;
  readonly t: TFunction;
}

function ExpandCollapseButton(props: ExpandCollapseButtonProps) {
  return (
    <Button
      kind={'ghost'}
      renderIcon={props.collapsed ? ChevronUp16 : ChevronDown16}
      iconDescription={props.t(
        props.collapsed ? 'icon.expand' : 'icon.collapse',
      )}
      // disabled={disabled}
      size={'sm'}
      tooltipPosition={'right'}
      hasIconOnly={true}
      onClick={() =>
        props.dispatch({
          tag: 'toggle-expand-collapse',
          path: props.path,
        })
      }
    />
  );
}

function ViewArray(p: ViewValueProps<JvArray>): React.ReactElement {
  const { dispatch, path, value, model, renderOptions } = p;
  const { t } = model;
  const isAdding = p.model.adding.isJust();
  return (
    <WrapErrors {...p}>
      <div className="jv-array">
        {value.elems.length === 0 ? (
          <div className="empty-obj">{t('emptyArray')}</div>
        ) : (
          <>
            {value.elems.map((elemValue, elemIndex) => {
              const elemPath = path.append(elemIndex.toString());
              const isCollapsed = p.model.collapsedPaths.has(elemPath.format());
              return (
                <div className={'array-elem'} key={`value-${elemIndex}`}>
                  <div className={'array-elem-head'}>
                    {!renderOptions?.hideCollapsiblePanel && (
                      <div className="prop-expand">
                        <ExpandCollapseButton
                          collapsed={isCollapsed}
                          dispatch={dispatch}
                          path={elemPath}
                          t={t}
                        />
                      </div>
                    )}
                    <div className={'elem-name'}>#{elemIndex}</div>
                    <div className={'prop-menu'}>
                      <MenuTrigger
                        dispatch={dispatch}
                        path={elemPath}
                        disabled={isAdding}
                        t={t}
                        renderOptions={renderOptions}
                      />
                    </div>
                  </div>
                  {isCollapsed ? (
                    <></>
                  ) : (
                    <div className={'elem-value'}>
                      <ViewJsonValue
                        {...p}
                        path={elemPath}
                        value={elemValue}
                        renderOptions={renderOptions}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </WrapErrors>
  );
}

function dispatchUpdateProperty(
  p: ViewValueProps<JsonValue>,
  newValue: JsonValue,
  selectText?: boolean,
) {
  p.dispatch({
    tag: 'update-property',
    path: p.path,
    value: newValue,
    selectText,
  });
}

function ViewNumber(p: ViewValueProps<JvNumber>): React.ReactElement {
  const { t } = p.model;
  return (
    <TextInput
      labelText={t('numberValueLabel', { path: p.path.format('.') }).toString()}
      hideLabel={true}
      id={'input-' + p.path.format('_')}
      type="number"
      value={p.value.value}
      disabled={p.model.adding.isJust()}
      invalidText={errorsToInvalidText(p)}
      invalid={isInvalid(p)}
      onChange={(evt) => {
        let newValue = parseFloat(evt.target.value);
        let selectText = false;
        if (isNaN(newValue)) {
          newValue = 0;
          selectText = true;
        }
        dispatchUpdateProperty(
          p,
          { tag: 'jv-number', value: newValue },
          selectText,
        );
      }}
    />
  );
}

function errorsToInvalidText(p: ViewValueProps<JsonValue>): string {
  return getErrorsAtPath(p)
    .map((e) => e.message)
    .join(', ');
}

function getErrorsAtPath(
  p: ViewValueProps<JsonValue>,
): ReadonlyArray<JsValidationError> {
  return p.model.errors.get(p.path.format()) ?? [];
}

function isInvalid(p: ViewValueProps<JsonValue>): boolean {
  return getErrorsAtPath(p).length > 0;
}

function ViewStringDefault(p: ViewValueProps<JvString>): React.ReactElement {
  const { t } = p.model;
  return (
    <TextInput
      labelText={t('stringValueLabel', { path: p.path.format('.') }).toString()}
      hideLabel={true}
      id={'input-' + p.path.format('_')}
      type="text"
      value={p.value.value}
      disabled={p.model.adding.isJust()}
      invalidText={errorsToInvalidText(p)}
      invalid={isInvalid(p)}
      placeholder={t('stringValuePlaceholder')}
      onChange={(evt) => {
        const newStr = evt.target.value;
        dispatchUpdateProperty(p, { tag: 'jv-string', value: newStr });
      }}
    />
  );
}

function ViewString(p: ViewValueProps<JvString>): React.ReactElement {
  const fmtPath = p.path.format();

  const formats = p.model.formats.get(fmtPath) ?? [];
  if (formats.length === 0) {
    // no formats, check for proposals (enum, examples etc)
    const proposals = p.model.comboBoxes.get(fmtPath) ?? [];
    if (proposals.length === 0) {
      return <ViewStringDefault {...p} />;
    } else {
      return ViewStringWithCombo({ ...p, proposals });
    }
  } else {
    // we have formats !
    return <ViewStringWithFormats {...p} formats={formats} />;
  }
}

interface ViewStringWithComboProps extends ViewValueProps<JvString> {
  readonly proposals: ReadonlyArray<string>;
}

function ViewStringWithCombo(p: ViewStringWithComboProps): React.ReactElement {
  const { t } = p.model;
  return (
    <ComboBox
      id={'input-' + p.path.format('_')}
      ariaLabel={t('stringValueComboLabel', {
        path: p.path.format('.'),
      }).toString()}
      disabled={p.model.adding.isJust()}
      invalidText={errorsToInvalidText(p)}
      invalid={isInvalid(p)}
      items={p.proposals}
      value={p.value.value}
      selectedItem={p.value.value}
      placeholder={''}
      onChange={(item) => {
        dispatchUpdateProperty(p, {
          tag: 'jv-string',
          value: item.selectedItem ?? '',
        });
      }}
      onInputChange={(text) => {
        dispatchUpdateProperty(p, {
          tag: 'jv-string',
          value: text ?? '',
        });
      }}
    />
  );
}

interface MyTimePickerProps {
  readonly path: JsPath;
  readonly onChange: (value: string) => void;
  readonly value: string;
  readonly isInvalid: boolean;
  readonly invalidText: string;
  readonly t: TFunction;
}

function MyTimePicker(props: MyTimePickerProps) {
  const fmtPath = props.path.format('_');
  const { onChange, value, isInvalid, invalidText, t } = props;
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
      invalidText={invalidText}
      invalid={isInvalid}
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
          {[<SelectItem text={''} value={''} key={'item'} />].concat(
            allOffsets.map((offset, i) => (
              <SelectItem value={offset} text={offset} key={'item-' + i} />
            )),
          )}
        </TimePickerSelect>
      </div>
    </TimePicker>
  );
}

interface MyDatePickerProps {
  readonly path: JsPath;
  readonly value: string;
  readonly onChange: (s: string) => void;
  readonly isInvalid: boolean;
  readonly invalidText: string;
  readonly t: TFunction;
  readonly language: string;
}

function MyDatePicker(props: MyDatePickerProps) {
  const fmtPath = props.path.format('_');
  const { t } = props;
  return (
    <DatePicker
      id={'date-picker-' + fmtPath}
      datePickerType="single"
      dateFormat={'Y-m-d'}
      onChange={(dates, str) => {
        props.onChange(str);
      }}
      value={props.value}
      /* @ts-ignore */
      locale={props.language}
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
        invalidText={props.invalidText}
        invalid={props.isInvalid}
      />
    </DatePicker>
  );
}

interface ViewStringWithFormatsProps extends ViewValueProps<JvString> {
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
              value={p.value.value}
              onChange={(s) =>
                p.dispatch({
                  tag: 'update-property',
                  path: p.path,
                  value: jvString(s),
                })
              }
              isInvalid={isInvalid(p)}
              invalidText={errorsToInvalidText(p)}
              t={p.model.t}
              language={p.language}
            />
          );
        }
        case 'date-time': {
          const invalid = isInvalid(p);
          const dt = new MyDateTime(p.value.value);
          return (
            <div className={'date-time-picker'}>
              <div className={'date-time-picker__date'}>
                <MyDatePicker
                  path={p.path}
                  value={dt.date}
                  onChange={(s) => {
                    const dt2 = dt.setDate(s);
                    p.dispatch({
                      tag: 'update-property',
                      path: p.path,
                      value: jvString(dt2.dateTime),
                    });
                  }}
                  isInvalid={invalid}
                  invalidText={errorsToInvalidText(p)}
                  t={p.model.t}
                  language={p.language}
                />
              </div>
              <div className={'date-time-picker__time'}>
                <MyTimePicker
                  path={p.path}
                  onChange={(s) => {
                    const dt2 = dt.setTime(s);
                    p.dispatch({
                      tag: 'update-property',
                      path: p.path,
                      value: jvString(dt2.dateTime),
                    });
                  }}
                  value={dt.time.fullTime}
                  isInvalid={invalid}
                  invalidText={errorsToInvalidText(p)}
                  t={p.model.t}
                />
              </div>
            </div>
          );
        }
        case 'time': {
          return (
            <MyTimePicker
              path={p.path}
              onChange={(s) =>
                p.dispatch({
                  tag: 'update-property',
                  path: p.path,
                  value: jvString(s),
                })
              }
              value={p.value.value}
              isInvalid={isInvalid(p)}
              invalidText={errorsToInvalidText(p)}
              t={p.model.t}
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

function ViewBoolean(p: ViewValueProps<JvBoolean>): React.ReactElement {
  const { t } = p.model;
  return (
    <WrapErrors {...p}>
      <div className="checkbox-wrapper">
        <Checkbox
          labelText={t('booleanValueLabel', {
            path: p.path.format('.'),
          }).toString()}
          hideLabel={true}
          id={'input-' + p.path.format('_')}
          checked={p.value.value}
          disabled={p.model.adding.isJust()}
          onChange={() => {
            dispatchUpdateProperty(p, {
              tag: 'jv-boolean',
              value: !p.value.value,
            });
          }}
        />
      </div>
    </WrapErrors>
  );
}

function ViewNull(p: ViewValueProps<JvNull>): React.ReactElement {
  const classes = ['js-null']
    .concat(isInvalid(p) ? ['form-error'] : [])
    .join(' ');
  return (
    <WrapErrors {...p}>
      <div className={classes}>null</div>
    </WrapErrors>
  );
}

export const onMenuTriggerClick =
  (dispatch: Dispatcher<Msg>, propertyPath: JsPath) =>
  (e: React.MouseEvent<HTMLElement>) => {
    const btnBox = e.target as HTMLElement;
    if (btnBox) {
      const rb = box(pos(e.clientX, e.clientY), Dim.zero);
      dispatch({
        tag: 'menu-trigger-clicked',
        path: propertyPath,
        refBox: rb, //box(rb.p.add(pos(rb.d.w / 2, rb.d.h / 2)), Dim.zero),
      });
    }
  };

export interface ViewErrorsProps {
  errors: ReadonlyArray<JsValidationError>;
}

export function ViewErrors(props: ViewErrorsProps) {
  return props.errors.length > 0 ? (
    <div className="form-errors">
      {props.errors.map((e) => e.message).join(', ')}
    </div>
  ) : (
    <></>
  );
}

export const WrapErrors: React.FunctionComponent<ViewValueProps<JsonValue>> = (
  p,
) => {
  const errorsAtPath = getErrorsAtPath(p);
  return (
    <>
      {p.children}
      {errorsAtPath.length > 0 ? <ViewErrors errors={errorsAtPath} /> : <></>}
    </>
  );
};

export interface MenuTriggerProps {
  readonly dispatch: Dispatcher<Msg>;
  readonly path: JsPath;
  readonly disabled: boolean;
  readonly t: TFunction;
  readonly renderOptions?: RenderOptions;
}

export function MenuTrigger(props: MenuTriggerProps) {
  const { disabled, path, dispatch, t, renderOptions } = props;
  return (
    <Button
      iconDescription={t('icon.openMenu')}
      disabled={disabled}
      size={'sm'}
      kind={'ghost'}
      renderIcon={OverflowMenuVertical16}
      tooltipPosition={'left'}
      hasIconOnly={true}
      onClick={onMenuTriggerClick(dispatch, path)}
      style={{
        overflow: renderOptions?.hideMenuTooltip ? 'hidden' : undefined,
      }}
    />
  );
}

const allOffsets = [
  'Z',
  '+01:00',
  '+02:00',
  '+03:00',
  '+04:00',
  '+04:30',
  '+05:00',
  '+05:30',
  '+05:45',
  '+06:00',
  '+06:30',
  '+07:00',
  '+08:00',
  '+08:45',
  '+09:00',
  '+09:30',
  '+10:00',
  '+10:30',
  '+11:00',
  '+12:00',
  '+12:45',
  '+13:00',
  '+14:00',
  '-01:00',
  '-02:00',
  '-02:30',
  '-03:00',
  '-04:00',
  '-05:00',
  '-06:00',
  '-07:00',
  '-08:00',
  '-09:00',
  '-09:30',
  '-10:00',
  '-11:00',
  '-12:00',
];

class MyDateTime {
  readonly date: string;
  readonly time: MyTime;

  constructor(readonly dateTime: string) {
    this.date = '';
    this.time = new MyTime('');
    const sepIndex = dateTime.indexOf('T');
    if (sepIndex !== -1) {
      // separator found, extract date and time parts
      this.date = dateTime.substring(0, sepIndex);
      this.time = new MyTime(dateTime.substring(sepIndex + 1));
    }
  }

  setDate(date: string): MyDateTime {
    return new MyDateTime(date + 'T' + this.time.fullTime);
  }

  setTime(time: string): MyDateTime {
    return new MyDateTime(this.date + 'T' + time);
  }
}

class MyTime {
  readonly time: string;
  readonly offset: string;

  constructor(readonly fullTime: string) {
    this.time = fullTime;
    this.offset = '';
    for (let i = 0; i < allOffsets.length; i++) {
      const offset = allOffsets[i];
      if (fullTime.endsWith(offset)) {
        this.time = fullTime.substring(0, fullTime.length - offset.length);
        this.offset = offset;
        break;
      }
    }
  }

  setTime(time: string): MyTime {
    return new MyTime(time + this.offset);
  }

  setOffset(offset: string): MyTime {
    return new MyTime(this.time + offset);
  }
}
