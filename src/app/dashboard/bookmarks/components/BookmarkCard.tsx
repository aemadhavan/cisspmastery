import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookmarkX } from "lucide-react";
import type { BookmarkedCard } from "../hooks/useBookmarks";

interface BookmarkCardProps {
    bookmark: BookmarkedCard;
    bookmarks: BookmarkedCard[];
    onRemove: (flashcardId: string) => void;
}

export function BookmarkCard({ bookmark, bookmarks, onRemove }: BookmarkCardProps) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-all">
            {/* Class and Deck Info */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-400 mb-1 truncate">
                        {bookmark.className}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                        {bookmark.deckName}
                    </p>
                </div>
                <Button
                    onClick={() => onRemove(bookmark.flashcardId)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 -mt-2 -mr-2"
                    title="Remove bookmark"
                >
                    <BookmarkX className="w-4 h-4" />
                </Button>
            </div>

            {/* Question Preview */}
            <div className="mb-4">
                <p className="text-white text-sm line-clamp-4">
                    {bookmark.question}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
                <Link href={`/dashboard/bookmarks/study?start=${bookmarks.findIndex(b => b.id === bookmark.id)}`} className="block">
                    <Button
                        variant="outline"
                        className="w-full border-purple-400 text-purple-200 hover:bg-purple-500/10"
                    >
                        Study This Card
                    </Button>
                </Link>
                <Link href={`/dashboard/deck/${bookmark.deckId}`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-400 hover:text-white text-xs"
                    >
                        View Full Deck
                    </Button>
                </Link>
            </div>
        </div>
    );
}
