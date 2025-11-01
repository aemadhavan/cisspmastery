import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { classes, userCardProgress, flashcards, decks } from "@/lib/db/schema";
import { eq, and, sql, asc, inArray } from "drizzle-orm";

const getColorClass = (color: string | null) => {
  const colorMap: { [key: string]: string } = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
    teal: "bg-teal-500",
  };
  return colorMap[color || "purple"] || "bg-purple-500";
};

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const hasPaidPlan = has({ plan: 'paid' });

  // Fetch all classes with their decks and flashcards
  const allClasses = await db.query.classes.findMany({
    where: eq(classes.isPublished, true),
    orderBy: [asc(classes.order)],
    with: {
      decks: {
        where: eq(decks.isPublished, true),
        orderBy: [asc(decks.order)],
        with: {
          flashcards: {
            where: eq(flashcards.isPublished, true),
          },
        },
      },
    },
  });

  // Calculate total flashcard count and progress for each class
  const classesWithProgress = await Promise.all(
    allClasses.map(async (cls) => {
      const flashcardIds = cls.decks.flatMap((deck) =>
        deck.flashcards.map((card) => card.id)
      );

      const totalCards = flashcardIds.length;
      const deckCount = cls.decks.length;

      // Get user's progress for this class
      let progress = 0;
      if (totalCards > 0 && flashcardIds.length > 0) {
        const progressRecords = await db
          .select()
          .from(userCardProgress)
          .where(
            and(
              eq(userCardProgress.clerkUserId, userId),
              inArray(userCardProgress.flashcardId, flashcardIds)
            )
          );

        progress = Math.round((progressRecords.length / totalCards) * 100);
      }

      return {
        id: cls.id,
        order: cls.order,
        name: cls.name,
        description: cls.description,
        icon: cls.icon,
        color: cls.color,
        cardCount: totalCards,
        deckCount,
        progress,
      };
    })
  );

  const totalCards = classesWithProgress.reduce((sum, cls) => sum + cls.cardCount, 0);

  // Get user's overall studied cards count
  const [studiedCardsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userCardProgress)
    .where(eq(userCardProgress.clerkUserId, userId));

  const studiedCards = studiedCardsResult?.count || 0;

  // For free users, limit the total cards displayed and used in calculations
  const displayTotalCards = hasPaidPlan ? totalCards : Math.min(totalCards, 10);
  const overallProgress = displayTotalCards > 0 ? Math.round((studiedCards / displayTotalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            CISSP Mastery Dashboard
          </h1>
          <p className="text-gray-300">
            Master CISSP concepts with confidence-based learning
          </p>
        </div>

        {/* Free User Banner */}
        {!hasPaidPlan && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Unlock Full Access
                </h3>
                <p className="text-purple-100">
                  Get unlimited access to all flashcards and advanced features
                </p>
              </div>
              <Link
                href="/pricing"
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-full transition-colors whitespace-nowrap"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {displayTotalCards}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Across {classesWithProgress.length} classes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Cards Studied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{studiedCards}</div>
              <p className="text-xs text-gray-400 mt-1">
                Keep going!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* CISSP Classes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Study by Class
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classesWithProgress.map((cls) => (
              <Link
                key={cls.id}
                href={`/dashboard/class/${cls.id}`}
                className="group"
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all hover:border-purple-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {cls.icon && (
                            <span className="text-2xl">{cls.icon}</span>
                          )}
                          <div className={`w-3 h-3 rounded-full ${getColorClass(cls.color)}`}></div>
                        </div>
                        <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                          {cls.name}
                        </CardTitle>
                      </div>
                    </div>
                    {cls.description && (
                      <CardDescription className="text-gray-400 text-sm mt-2">
                        {cls.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">
                        {cls.deckCount} deck{cls.deckCount !== 1 ? 's' : ''} • {hasPaidPlan ? cls.cardCount : Math.min(cls.cardCount, 10)} cards
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={cls.progress} className="flex-1" />
                      <span className="text-sm text-gray-400 font-medium">
                        {cls.progress}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Study Tips */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Study Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Study consistently - 20-30 minutes daily is better than cramming</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Be honest with confidence ratings - this helps optimize your learning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Focus on understanding concepts, not just memorization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Review cards you rated low more frequently</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
