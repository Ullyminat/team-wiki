"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageTree } from "./PageTree";

interface WorkspaceSectionProps {
    workspace: {
        id: string;
        name: string;
        documents: any[];
    };
    colorClass: string;
}

export function WorkspaceSection({ workspace, colorClass }: WorkspaceSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const char = workspace.name.charAt(0).toUpperCase();

    return (
        <div className="space-y-1">
            <div className="flex items-center group">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-white/5 rounded transition-colors text-zinc-500 hover:text-white"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                    )}
                </button>
                <Link
                    href={`/dashboard/ws/${workspace.id}`}
                    className="flex-1 flex items-center gap-3 px-1 py-2 rounded-md transition-colors text-sm text-zinc-400"
                >
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${colorClass}`}>
                        {char}
                    </span>
                    <span className="truncate group-hover:text-white transition-colors font-medium text-zinc-300">
                        {workspace.name}
                    </span>
                </Link>
            </div>

            {isExpanded && (
                <div className="mb-4 ml-4 border-l border-white/5">
                    <PageTree nodes={workspace.documents || []} />
                </div>
            )}
        </div>
    );
}
