"use client";

import React from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathRendererProps {
  content: string;
}

export default function MathRenderer({ content }: MathRendererProps) {
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const latex = part.slice(2, -2).trim();
          try {
            return <BlockMath key={index} math={latex} />;
          } catch {
            return <code key={index}>{latex}</code>;
          }
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1).trim();
          try {
            return <InlineMath key={index} math={latex} />;
          } catch {
            return <code key={index}>{latex}</code>;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
