import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MathRenderer from "@/components/MathRenderer";

interface ProblemCardProps {
  id: string;
  title: string;
  body: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topicName?: string;
  status?: string;
  nextReviewAt?: string;
  showReviewButton?: boolean;
}

const difficultyColors = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  LEARNING: "bg-purple-100 text-purple-800",
  REVIEW: "bg-orange-100 text-orange-800",
  MASTERED: "bg-green-100 text-green-800",
};

export default function ProblemCard({
  id,
  title,
  body,
  difficulty,
  topicName,
  status,
  nextReviewAt,
  showReviewButton,
}: ProblemCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={difficultyColors[difficulty]} variant="outline">
              {difficulty}
            </Badge>
            {status && (
              <Badge className={statusColors[status]} variant="outline">
                {status}
              </Badge>
            )}
          </div>
        </div>
        {topicName && (
          <p className="text-sm text-muted-foreground">{topicName}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
          <MathRenderer content={body} />
        </div>
        <div className="flex items-center justify-between">
          {nextReviewAt && (
            <span className="text-xs text-muted-foreground">
              Next review: {new Date(nextReviewAt).toLocaleDateString()}
            </span>
          )}
          {showReviewButton && (
            <Link href={`/app/study/${id}`}>
              <Button size="sm">Review now</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
