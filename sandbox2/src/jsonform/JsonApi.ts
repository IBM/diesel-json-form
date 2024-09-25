import { Tuple } from 'tea-cup-core';

export type JANode = JAObject | JAArray | JAString | JANumber | JABool | JANull;

export interface JAObject {
  readonly tag: 'object';
  properties: Tuple<string, JANode>[];
}

export interface JAArray {
  readonly tag: 'array';
  items: JANode[];
}

export interface JAString {
  readonly tag: 'string';
  value: string;
}

export interface JANumber {
  readonly tag: 'number';
  value: number;
}

export interface JABool {
  readonly tag: 'boolean';
  value: boolean;
}

export interface JANull {
  readonly tag: 'null';
}
