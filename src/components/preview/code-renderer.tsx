"use client";

import { Highlight, themes } from "prism-react-renderer";

interface CodeRendererProps {
  content: string;
  language: string;
}

export function CodeRenderer({ content, language }: CodeRendererProps) {
  return (
    <Highlight theme={themes.nightOwl} code={content} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className="p-3 sm:p-6 text-xs sm:text-[13px] leading-relaxed overflow-auto font-mono"
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="inline-block w-10 text-right pr-4 select-none opacity-40">
                {i + 1}
              </span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
