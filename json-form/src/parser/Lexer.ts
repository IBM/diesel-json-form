export type TokenType =
  | 'object-open'
  | 'object-close'
  | 'string'
  | 'numeric'
  | 'boolean'
  | 'null'
  | 'array-open'
  | 'array-close'
  | 'comma'
  | 'semicolon';

export class Token {
  constructor(
    readonly type: TokenType,
    readonly text: string,
    readonly index: number,
  ) {}

  get length(): number {
    return this.text.length;
  }
}

abstract class Rule {
  abstract test(str: string, index: number): Token | undefined;
}

class StrRule extends Rule {
  constructor(
    readonly s: string,
    readonly f: (text: string, index: number) => Token,
  ) {
    super();
  }

  test(str: string, index: number): Token | undefined {
    if (str.startsWith(this.s)) {
      return this.f(this.s, index);
    }
  }
}

class RegexRule extends Rule {
  constructor(
    private readonly r: RegExp,
    private readonly f: (str: string, index: number) => Token,
  ) {
    super();
  }

  test(str: string, index: number): Token | undefined {
    const matches = str.match(this.r);
    if (matches?.length) {
      const length = matches[0].length;
      const text = str.substring(0, length);
      return this.f(text, index);
    } else {
      return undefined;
    }
  }
}

const RULES: readonly Rule[] = [
  new StrRule('{', (s, i) => new Token('object-open', s, i)),
  new StrRule('}', (s, i) => new Token('object-close', s, i)),
  new StrRule('[', (s, i) => new Token('array-open', s, i)),
  new StrRule(']', (s, i) => new Token('array-close', s, i)),
  new StrRule('null', (s, i) => new Token('null', s, i)),
  new StrRule(',', (s, i) => new Token('comma', s, i)),
  new StrRule(':', (s, i) => new Token('semicolon', s, i)),
  new StrRule('true', (s, i) => new Token('boolean', s, i)),
  new StrRule('false', (s, i) => new Token('boolean', s, i)),
  new RegexRule(
    new RegExp('^"([^"\\\\]|\\\\.)*"'),
    (s, i) => new Token('string', s, i),
  ),
  new RegexRule(
    new RegExp('^-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?'),
    (s, i) => new Token('numeric', s, i),
  ),
];

export class Lexer {
  constructor(
    private readonly json: string,
    private index: number = 0,
  ) {}

  static getTokens(str: string): Token[] {
    const l = new Lexer(str);
    const res = [];
    while (l.hasNext()) {
      res.push(l.next());
    }
    return res;
  }

  hasNext(): boolean {
    return this.index < this.json.length;
  }

  next(): Token {
    if (this.hasNext()) {
      debugger;
      const sub = this.json.substring(this.index);
      console.log('next', sub, this.index);
      const matches: Token[] = [];
      for (const rule of RULES) {
        const t = rule.test(sub, this.index);
        if (t) {
          console.log('>>', this.index, 'matched', rule, t);
          matches.push(t);
        } else {
          console.log('>>', this.index, 'not matched', rule);
        }
      }
      if (matches.length === 0) {
        throw new Error('invalid token at ' + this.index);
      }
      matches.sort((t1, t2) => t2.length - t1.length); // descending sort
      const t = matches[0];
      this.index += t.length;
      console.log('new index', this.index);
      debugger;
      return t;
    } else {
      throw new Error('reached eos, no more tokens');
    }
  }
}
