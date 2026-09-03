import type readline from "node:readline";

export type EditAction =
  | "word-left"
  | "word-right"
  | "line-start"
  | "line-end"
  | "delete-word"
  | "delete-line"
  | null;

const isWordChar = (char: string | undefined): boolean =>
  char !== undefined && char !== "\n" && !/\s/.test(char);

export function wordStart(chars: readonly string[], cursor: number): number {
  let index = Math.min(cursor, chars.length);
  while (index > 0 && !isWordChar(chars[index - 1]) && chars[index - 1] !== "\n") index -= 1;
  if (index > 0 && chars[index - 1] === "\n" && index === cursor) return index - 1;
  while (index > 0 && isWordChar(chars[index - 1])) index -= 1;
  return index;
}

export function wordEnd(chars: readonly string[], cursor: number): number {
  let index = Math.max(0, cursor);
  while (index < chars.length && !isWordChar(chars[index]) && chars[index] !== "\n") index += 1;
  if (index < chars.length && chars[index] === "\n" && index === cursor) return index + 1;
  while (index < chars.length && isWordChar(chars[index])) index += 1;
  return index;
}

export function lineStart(chars: readonly string[], cursor: number): number {
  let index = cursor;
  while (index > 0 && chars[index - 1] !== "\n") index -= 1;
  return index;
}

export function lineEnd(chars: readonly string[], cursor: number): number {
  let index = cursor;
  while (index < chars.length && chars[index] !== "\n") index += 1;
  return index;
}

export function resolveEditKey(key: readline.Key): EditAction {
  const sequence = key.sequence ?? "";
  const superModifier = /;9[A-Z~]$/.test(sequence);

  if (key.ctrl && key.name === "u") return "delete-line";
  if (key.ctrl && key.name === "w") return "delete-word";
  if (key.meta && key.name === "backspace") return "delete-word";
  if (key.ctrl && key.name === "a") return "line-start";
  if (key.ctrl && key.name === "e") return "line-end";

  if (key.meta && key.name === "b") return "word-left";
  if (key.meta && key.name === "f") return "word-right";

  if (key.name === "left" && (key.meta || key.ctrl)) return superModifier ? "line-start" : "word-left";
  if (key.name === "right" && (key.meta || key.ctrl)) return superModifier ? "line-end" : "word-right";
  if (key.name === "up" && key.meta && !superModifier) return "line-start";
  if (key.name === "down" && key.meta && !superModifier) return "line-end";

  return null;
}
