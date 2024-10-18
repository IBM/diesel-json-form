import { err, ok, Result } from 'tea-cup-core';
import {
  JsonProperty,
  JsonValue,
  jvArray,
  JvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
} from '../JsonValue';
import { Lexer, Token } from './Lexer';

export function parseJsonValue(str: string): Result<string, JsonValue> {
  // try {
  //   return valueFromAny(JSON.parse(str));
  // } catch (e) {
  //   return err('unable to parse json');
  // }
  const l = new Lexer(str);
  return parseValue(l.next(), l);
}

function invalidToken(t: Token): Result<string, never> {
  return err('invalid token : ' + t.text + ' at ' + t.index);
}

function removeDoubleQuotes(s: string): string {
  return s.substring(0, s.length - 1).substring(1);
}

function parseValue(t: Token, lexer: Lexer): Result<string, JsonValue> {
  switch (t.type) {
    case 'string':
      return ok(jvString(removeDoubleQuotes(t.text)));
    case 'boolean':
      return ok(jvBool(t.text === 'true'));
    case 'numeric':
      return ok(jvNumber(t.text));
    case 'null':
      return ok(jvNull);
    case 'object-open':
      const props = parseProps(lexer);
      return props.map((ps) => jvObject(ps));
    case 'array-open':
      return parseArray(lexer);
    default:
      return invalidToken(t);
  }
}

function parseProps(lexer: Lexer): Result<string, JsonProperty[]> {
  const props: JsonProperty[] = [];
  let t = lexer.next();
  while (lexer.hasNext()) {
    if (t.type === 'object-close') {
      break;
    } else if (t.type === 'string') {
      const next = lexer.next();
      if (next.type !== 'semicolon') {
        return invalidToken(next);
      }
      const value = parseValue(lexer.next(), lexer);
      switch (value.tag) {
        case 'Ok': {
          props.push({ name: removeDoubleQuotes(t.text), value: value.value });
          break;
        }
        case 'Err': {
          return err(value.err);
        }
      }
      const comma = lexer.next();
      switch (comma.type) {
        case 'object-close': {
          t = lexer.next();
          break;
        }
        case 'comma': {
          t = lexer.next();
          break;
        }
        default: {
          return invalidToken(comma);
        }
      }
    }
  }
  return ok(props);
}

function parseArray(lexer: Lexer): Result<string, JvArray> {
  const items: JsonValue[] = [];
  let next = lexer.next();
  while (next.type !== 'array-close') {
    const v = parseValue(next, lexer);
    switch (v.tag) {
      case 'Ok': {
        items.push(v.value);
        break;
      }
      case 'Err': {
        return err(v.err);
      }
    }
    next = lexer.next();
    switch (next.type) {
      case 'array-close': {
        break;
      }
      case 'comma': {
        next = lexer.next();
        break;
      }
    }
  }
  return ok(jvArray(items));
}
