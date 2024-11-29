import { Lexer, Token } from './Lexer';

export type Event =
  | 'end-array'
  | 'end-object'
  | 'key-name'
  | 'start-array'
  | 'start-object'
  | 'value-false'
  | 'value-true'
  | 'value-null'
  | 'value-number'
  | 'value-string';

abstract class State {
  constructor(readonly lexer: Lexer) {}

  abstract next(): State | undefined;
}

class InitialState extends State {
  private done: boolean = false;

  constructor(lexer: Lexer) {
    super(lexer);
  }

  next(): State | undefined {
    if (this.done) {
      throw 'unexpected token at ' + t.index;
    }
    const t = this.lexer.next();
    switch (t.type) {
      case 'string': {
        if (!this.done) {
          return;
        }
      }
      case 'object-open':
      default:
        throw 'unexpected token at ' + t.index;
    }
  }
}

export class JsonParser {
  private lexer: Lexer;
  private states: State[];

  constructor(json: string) {
    this.lexer = new Lexer(json);
    this.states = [new InitialState(this.lexer)];
  }

  getString(): string | undefined {
    throw 'TODO';
  }

  hasNext(): boolean {
    return this.lexer.hasNext();
  }

  private lastState(): State {
    return this.states[this.states.length - 1];
  }

  next(): Event {
    const t = this.lexer.next();
    switch (t.type) {
      case 'string': {
        const lastState = this.lastState();
        if (lastState.tag === 'start-object') {
          if (lastState.elementDone) {
          }

          this.states.push('key-name');
          return 'key-name';
        } else if (lastState === 'key-name') {
          this.states.pop();
          return 'value-string';
        } else {
          throw 'found unexpected string at ' + t.index;
        }
      }
      case 'object-open': {
        const lastState = this.lastState();
        this.states.push('start-object');
        if (!lastState) {
          return 'start-object';
        } else if (lastState === 'key-name') {
          return 'start-object';
        } else {
          throw 'found unexpected object open at ' + t.index;
        }
      }
      case 'object-close': {
        const lastState = this.lastState();
        if (!lastState) {
          throw 'unexpected object close at ' + t.index;
        } else if (lastState === 'start-object') {
          // pop twice (attr and obj)
          this.states.pop();
          const newLast = this.lastState();
          if (newLast === 'key-name') {
            this.states.pop();
          } else if (newLast === undefined) {
            this.done = true;
          }
          return 'end-object';
        } else {
          throw 'found unexpected object close at ' + t.index;
        }
      }
      case 'semicolon': {
        const lastState = this.lastState();
        if (lastState === 'key-name') {
          return this.next();
        } else {
          throw 'found unexpected semi at ' + t.index;
        }
      }
      case 'comma': {
        if (this.commaProcessed) {
          throw 'found unexpected comma at ' + t.index;
        }
        const lastState = this.lastState();
        if (lastState === 'start-object') {
          this.commaProcessed = true;
          return this.next();
        } else {
          throw 'found unexpected comma at ' + t.index;
        }
      }
      case 'boolean':
      case 'numeric':
      case 'null':
      case 'array-open':
      case 'array-close':
        throw 'TODO';
    }
  }
}

// export function parseJsonValue(str: string): Result<string, JsonValue> {
//   // try {
//   //   return valueFromAny(JSON.parse(str));
//   // } catch (e) {
//   //   return err('unable to parse json');
//   // }
//   const l = new Lexer(str);
//   return parseValue(l.next(), l);
// }

// // function invalidToken(t: Token): Result<string, never> {
// //   return err('invalid token : ' + t.text + ' at ' + t.index);
// // }

// function removeDoubleQuotes(s: string): string {
//   return s.substring(0, s.length - 1).substring(1);
// }

// export type JsonEvent = "value-false" | "value-true" |

// export function parse(json: string, callbacks: Callbacks): void {
//   callbacks.startParsing();
//   const lexer = new Lexer(json);
//   if (!lexer.hasNext()) {
//     callbacks.endParsing('eos');
//     return;
//   }
//   let t = lexer.next();

//   function next() {
//     t = lexer.next();
//   }

//   function accept(tt: TokenType): string | undefined {
//     if (t.type === tt) {
//       const s = t.text;
//       next();
//       return s;
//     }
//     return undefined;
//   }

//   function value(): void {
//     const str = accept('string');
//     if (str) {
//       callbacks.onString(removeDoubleQuotes(str));
//       return;
//     }
//     const num = accept('numeric');
//     if (num) {
//       callbacks.onNumber(num);
//       return;
//     }
//     const bool = accept('boolean');
//     if (bool) {
//       callbacks.onBoolean(bool === 'true');
//       return;
//     }
//     if (accept('null')) {
//       callbacks.onNull();
//       return;
//     }
//   }

//   value();

//   // function parseObject() {}

//   // switch (t.type) {
//   //   case 'string':
//   //     return ok(jvString(removeDoubleQuotes(t.text)));
//   //   case 'boolean':
//   //     return ok(jvBool(t.text === 'true'));
//   //   case 'numeric':
//   //     return ok(jvNumber(t.text));
//   //   case 'null':
//   //     return ok(jvNull);
//   //   case 'object-open':
//   //     return parseObject();
//   //   case 'array-open':
//   //     throw 'TODO';
//   //   // return parseArray(lexer);
//   //   default:
//   //     return invalidToken(t);
//   // }
//   // function parseValue(t: Token, lexer: Lexer): Result<string, JsonValue> {
//   //   switch (t.type) {
//   //     case 'string':
//   //       return ok(jvString(removeDoubleQuotes(t.text)));
//   //     case 'boolean':
//   //       return ok(jvBool(t.text === 'true'));
//   //     case 'numeric':
//   //       return ok(jvNumber(t.text));
//   //     case 'null':
//   //       return ok(jvNull);
//   //     case 'object-open':
//   //       const props = parseProps(lexer);
//   //       return props.map((ps) => jvObject(ps));
//   //     case 'array-open':
//   //       return parseArray(lexer);
//   //     default:
//   //       return invalidToken(t);
//   //   }
//   // }
//   // function parseProps(lexer: Lexer): Result<string, JsonProperty[]> {
//   //   const props: JsonProperty[] = [];
//   //   let t = lexer.next();
//   //   while (lexer.hasNext()) {
//   //     if (t.type === 'object-close') {
//   //       break;
//   //     } else if (t.type === 'string') {
//   //       const next = lexer.next();
//   //       if (next.type !== 'semicolon') {
//   //         return invalidToken(next);
//   //       }
//   //       const value = parseValue(lexer.next(), lexer);
//   //       switch (value.tag) {
//   //         case 'Ok': {
//   //           props.push({ name: removeDoubleQuotes(t.text), value: value.value });
//   //           break;
//   //         }
//   //         case 'Err': {
//   //           return err(value.err);
//   //         }
//   //       }
//   //       const comma = lexer.next();
//   //       switch (comma.type) {
//   //         case 'object-close': {
//   //           break;
//   //         }
//   //         case 'comma': {
//   //           t = lexer.next();
//   //           break;
//   //         }
//   //         default: {
//   //           return invalidToken(comma);
//   //         }
//   //       }
//   //     }
//   //   }
//   //   return ok(props);
//   // }
//   // function parseArray(lexer: Lexer): Result<string, JvArray> {
//   //   const items: JsonValue[] = [];
//   //   let next = lexer.next();
//   //   while (next.type !== 'array-close') {
//   //     const v = parseValue(next, lexer);
//   //     switch (v.tag) {
//   //       case 'Ok': {
//   //         items.push(v.value);
//   //         break;
//   //       }
//   //       case 'Err': {
//   //         return err(v.err);
//   //       }
//   //     }
//   //     next = lexer.next();
//   //     switch (next.type) {
//   //       case 'array-close': {
//   //         break;
//   //       }
//   //       case 'comma': {
//   //         next = lexer.next();
//   //         break;
//   //       }
//   //     }
//   //   }
//   //   return ok(jvArray(items));
//   // }
// }
