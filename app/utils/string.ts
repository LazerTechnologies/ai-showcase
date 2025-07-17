export const pluralize = (
  word: string,
  count: number,
  plural?: string
): string => {
  if (count === 1) return word;
  if (plural) return plural;
  if (word.endsWith("s")) return word;
  if (word.endsWith("y")) return `${word.slice(0, -1)}ies`;
  if (word.endsWith("ch")) return `${word}es`;
  if (word.endsWith("sh")) return `${word}es`;
  if (word.endsWith("x")) return `${word}es`;
  if (word.endsWith("z")) return `${word}es`;
  if (word.endsWith("o")) return `${word}es`;
  if (word.endsWith("f")) return `${word}ves`;
  if (word.endsWith("fe")) return `${word}ves`;
  if (word.endsWith("us")) return `${word}es`;
  if (word.endsWith("is")) return `${word}es`;
  if (word.endsWith("on")) return `${word}es`;
  if (word.endsWith("um")) return `${word}a`;
  if (word.endsWith("a")) return `${word}e`;
  if (word.endsWith("i")) return `${word}es`;
  return `${word}s`;
};
