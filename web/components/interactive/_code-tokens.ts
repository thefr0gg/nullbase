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

/** Classifies every character of `raw`, whitespace included — the shared
 *  scan both `tokenizeCode` (drops whitespace) and `highlightCode` (keeps
 *  it, to preserve original layout) build on. */
function scanTokens(raw: string): Array<{ text: string; type: CodeTokenType | "ws" }> {
  const tokens: Array<{ text: string; type: CodeTokenType | "ws" }> = [];
  for (const match of raw.matchAll(TOKEN_RE)) {
    const groups = match.groups!;
    if (groups.ws) tokens.push({ text: match[0], type: "ws" });
    else if (groups.comment) tokens.push({ text: match[0], type: "comment" });
    else if (groups.string) tokens.push({ text: match[0], type: "string" });
    else if (groups.number) tokens.push({ text: match[0], type: "number" });
    else if (groups.word) tokens.push({ text: match[0], type: KEYWORDS.has(match[0]) ? "keyword" : "identifier" });
    else tokens.push({ text: match[0], type: "punct" });
  }
  return tokens;
}

/** Splits one line/snippet of code into typed pieces, dropping whitespace
 *  (chips are laid out with CSS gap, not preserved spacing). */
export function tokenizeCode(raw: string): CodeToken[] {
  return scanTokens(raw).filter((t): t is CodeToken => t.type !== "ws");
}

/** Punctuation that's always its own chip, never merged into a neighboring
 *  chunk — these are the structural landmarks (block/argument/statement
 *  boundaries) a learner needs to place precisely, so folding them into a
 *  bigger chunk would make the drop target ambiguous. */
const STANDALONE_PUNCT = new Set(["{", "}", "(", ")", "[", "]", ";", ",", "<", ">"]);

/** Punctuation that glues tightly (no space either side) onto its
 *  neighbors when merged — these read as part of the identifier they
 *  touch (`a.b`, `x:`, `Self::new`), unlike e.g. `=` or `+`. */
const TIGHT_PUNCT = new Set([".", ":", "::", "->", "=>"]);

/** Order of "how much this token matters," used to pick one type/color for
 *  a merged chunk of several tokens (the most significant token wins). */
const TYPE_RANK: Record<CodeTokenType, number> = {
  comment: 6,
  string: 5,
  keyword: 4,
  number: 3,
  identifier: 2,
  punct: 1,
};

/** Merges a flat token stream into coarser drag pieces — e.g. `const x :
 *  number = 5 ;` (7 tokens) becomes `const x:` `number` `= 5` `;` (4 chips)
 *  — so beginners aren't asked to place one chip per character. Comments,
 *  strings, and `STANDALONE_PUNCT` landmarks are always kept as their own
 *  chip; everything else is grouped greedily up to `maxChunk` tokens. */
function mergeTokens(tokens: CodeToken[], maxChunk = 3): CodeToken[] {
  const merged: CodeToken[] = [];
  let chunk: CodeToken[] = [];

  function flush() {
    if (chunk.length === 0) return;
    const text = chunk.reduce((acc, t, i) => {
      if (i === 0) return t.text;
      return TIGHT_PUNCT.has(t.text) || TIGHT_PUNCT.has(chunk[i - 1].text) ? acc + t.text : `${acc} ${t.text}`;
    }, "");
    const type = chunk.reduce((best, t) => (TYPE_RANK[t.type] > TYPE_RANK[best] ? t.type : best), chunk[0].type);
    merged.push({ text, type });
    chunk = [];
  }

  for (const token of tokens) {
    const standalone = token.type === "comment" || token.type === "string" || STANDALONE_PUNCT.has(token.text);
    if (standalone || chunk.length >= maxChunk) flush();
    chunk.push(token);
    if (standalone) flush();
  }
  flush();

  return merged;
}

/** Same as `tokenizeCode`, but coarser: adjacent tokens are grouped into
 *  fewer, chunkier drag pieces (see `mergeTokens`) so exercises with long
 *  lines don't overwhelm beginners with one chip per token. This is what
 *  `OrderingExercise` builds its draggable pieces from. */
export function tokenizeCodeForExercise(raw: string): CodeToken[] {
  return mergeTokens(tokenizeCode(raw));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Colors a whole snippet (original spacing/newlines intact) as an HTML
 *  string — for read-only display (the "reveal answer" panel), as opposed
 *  to `tokenizeCode`'s discrete drag pieces. Safe for
 *  `dangerouslySetInnerHTML`: every `<`/`>`/`&` is escaped before any
 *  `<span>` is added, so the only tags produced are our own static-class
 *  ones. */
export function highlightCode(raw: string): string {
  return scanTokens(raw)
    .map(({ text, type }) => {
      const escaped = escapeHtml(text);
      if (type === "ws") return escaped;
      return `<span class="${codeTokenClassName(type)}">${escaped}</span>`;
    })
    .join("");
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
