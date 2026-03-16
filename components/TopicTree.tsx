"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface TopicWithProgress {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  problemCount: number;
  masteredCount: number;
  children: TopicWithProgress[];
}

interface TopicTreeProps {
  topics: TopicWithProgress[];
}

function TopicNode({ topic }: { topic: TopicWithProgress }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = topic.children.length > 0;
  const progress =
    topic.problemCount > 0
      ? Math.round((topic.masteredCount / topic.problemCount) * 100)
      : 0;

  return (
    <div className="ml-2">
      <div className="flex items-center gap-2 py-2">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-muted rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}
        <Link
          href={`/app/topics/${topic.slug}`}
          className="flex-1 hover:underline font-medium"
        >
          {topic.name}
        </Link>
        <div className="flex items-center gap-2 w-48">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground w-12 text-right">
            {topic.masteredCount}/{topic.problemCount}
          </span>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 border-l pl-2">
          {topic.children.map((child) => (
            <TopicNode key={child.id} topic={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopicTree({ topics }: TopicTreeProps) {
  return (
    <div className="space-y-1">
      {topics.map((topic) => (
        <TopicNode key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
