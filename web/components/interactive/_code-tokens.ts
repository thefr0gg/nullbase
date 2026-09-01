/**
 * A single, deliberately approximate code tokenizer shared by every
 * interactive primitive that needs to color individual pieces of source
 * code rather than a whole snippet at once (currently `OrderingExercise`'s
 * per-keyword drag pieces). It isn't a real per-language lexer — the
 * keyword list is the union of ~10 languages' keywords — so occasionally an
 * identifier in one language collides with a keyword in another. That's an
 * acceptable trade for one tokenizer that works everywhere instead of ten
 * exact ones, since the only thing riding on it is chip coloring, not
 * correctness.
 */

export type CodeTokenType = "comment" | "string" | "number" | "keyword" | "identifier" | "punct";

export interface CodeToken {
  text: string;
  type: CodeTokenType;
}

const KEYWORDS = new Set(
  [
    // JS / TS
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "switch", "case", "default",
    "break", "continue", "import", "from", "export", "class", "extends", "implements", "interface", "type",
    "new", "typeof", "instanceof", "async", "await", "try", "catch", "finally", "throw", "this", "super",
    "static", "get", "set", "enum", "namespace", "declare", "readonly", "public", "private", "protected",
    "null", "undefined", "true", "false", "void", "yield", "in", "of", "as",
    // Python
    "def", "elif", "except", "raise", "with", "lambda", "pass", "global", "nonlocal", "and", "or", "not", "is",
    "None", "True", "False", "self",
    // C / C++
    "int", "long", "short", "char", "float", "double", "unsigned", "signed", "struct", "union", "typedef",
    "sizeof", "goto", "include", "define", "ifdef", "ifndef", "pragma", "endif", "elif", "undef", "template",
    "virtual", "friend", "operator", "constexpr", "nullptr", "bool", "namespace", "delete",
    // Rust
    "fn", "mut", "loop", "match", "impl", "trait", "pub", "use", "mod", "crate", "where", "dyn", "unsafe",
    "move", "Self", "Some", "Ok", "Err", "ref",
    // Go
    "func", "package", "chan", "select", "range", "defer", "nil", "map", "go", "interface",
    // Java / C#
    "abstract", "final", "throws", "internal", "foreach", "string", "String", "boolean", "using", "base",
    // PHP
    "echo", "print", "elseif", "array", "require", "require_once", "include_once", "namespace", "function",
  ].filter((v, i, a) => a.indexOf(v) === i),
);

const BACKTICK = "`";
const TOKEN_RE = new RegExp(
  [
    "(?<comment>\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|#(?!include\\b|define\\b|ifdef\\b|ifndef\\b|pragma\\b|endif\\b|elif\\b|undef\\b)[^\\n]*)",
    `(?<string>'(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*"|${BACKTICK}(?:\\\\.|[^${BACKTICK}\\\\])*${BACKTICK})`,
    "(?<number>\\b\\d+(?:\\.\\d+)?\\b)",
    "(?<word>\\$?[A-Za-z_][\\w]*)",
    "(?<op>==|!=|<=|>=|&&|\\|\\||->|=>|::|\\+\\+|--|\\+=|-=|\\*=|\\/=|[-+*/%=<>!&|^~?:;,.()[\\]{}#$])",
    "(?<ws>\\s+)",
    "(?<other>.)",
  ].join("|"),
  "gu",
);

/** Splits one line/snippet of code into typed pieces, dropping whitespace
 *  (chips are laid out with CSS gap, not preserved spacing). */
export function tokenizeCode(raw: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  for (const match of raw.matchAll(TOKEN_RE)) {
    const groups = match.groups!;
    if (groups.ws) continue;
    if (groups.comment) tokens.push({ text: match[0], type: "comment" });
    else if (groups.string) tokens.push({ text: match[0], type: "string" });
    else if (groups.number) tokens.push({ text: match[0], type: "number" });
    else if (groups.word) tokens.push({ text: match[0], type: KEYWORDS.has(match[0]) ? "keyword" : "identifier" });
    else tokens.push({ text: match[0], type: "punct" });
  }
  return tokens;
}

export function codeTokenClassName(type: CodeTokenType): string {
  switch (type) {
    case "comment":
      return "text-text-secondary italic";
    case "string":
      return "text-success";
    case "number":
      return "text-tangerine";
    case "keyword":
      return "text-electric-blue font-semibold";
    case "punct":
      return "text-text-secondary";
    case "identifier":
      return "text-text-primary";
  }
}
