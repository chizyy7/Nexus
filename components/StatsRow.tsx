import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Flame, Trophy } from "lucide-react";

interface StatsRowProps {
  totalSeen: number;
  streak: number;
  masteryPercentage: number;
}

export default function StatsRow({
  totalSeen,
  streak,
  masteryPercentage,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <BookOpen className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold">{totalSeen}</p>
            <p className="text-sm text-muted-foreground">Problems Seen</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Flame className="h-8 w-8 text-orange-500" />
          <div>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-2xl font-bold">{masteryPercentage}%</p>
            <p className="text-sm text-muted-foreground">Mastery</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
