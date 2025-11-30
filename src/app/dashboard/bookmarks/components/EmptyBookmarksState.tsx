import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function EmptyBookmarksState() {
    return (
        <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-4">
                No bookmarks yet
            </h2>
            <p className="text-gray-400 mb-8">
                Start bookmarking cards while studying to easily find them later!
            </p>
            <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Start Studying
                </Button>
            </Link>
        </div>
    );
}
