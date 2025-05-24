import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from "next-themes";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import ts from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import js from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("markdown", markdown);

// Simple range parser function
function rangeParser(str: string): number[] {
  const ranges = str.split(",");
  const result: number[] = [];

  ranges.forEach((range) => {
    if (range.includes("-")) {
      const [start, end] = range.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      result.push(Number(range));
    }
  });

  return result;
}

interface CodeBlockProps {
  node?: {
    data?: {
      meta?: string | null;
    };
  };
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export default function Codeblock({
  node,
  className,
  ...props
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const hasLang = /language-(\w+)/.exec(className || "");
  const hasMeta = node?.data?.meta;
  const syntaxTheme = resolvedTheme === "dark" ? oneDark : oneLight;

  const applyHighlights = (lineNumber: number) => {
    if (hasMeta && node?.data) {
      const RE = /{([\d,-]+)}/;
      const metadata = (node.data.meta ?? "").replace(/\s/g, "");
      const strlineNumbers = RE?.test(metadata)
        ? RE?.exec(metadata)?.[1] || "0"
        : "0";
      const highlightLines = rangeParser(strlineNumbers);
      const highlight = highlightLines;
      const data = highlight.includes(lineNumber) ? "highlight" : undefined;
      return { data };
    } else {
      return {};
    }
  };
  return hasLang ? (
    <SyntaxHighlighter
      style={syntaxTheme}
      language={hasLang[1]}
      PreTag="div"
      className="codeStyle"
      showLineNumbers={true}
      wrapLines={Boolean(hasMeta)}
      useInlineStyles={true}
      lineProps={applyHighlights}
    >
      {String(props.children)}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props} />
  );
}
