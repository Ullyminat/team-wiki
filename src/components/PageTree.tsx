import Link from "next/link";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

interface DocNode {
    id: string;
    title: string;
    emoji?: string | null;
    children: DocNode[];
}

interface PageTreeProps {
    nodes: DocNode[];
    level?: number;
}

export function PageTree({ nodes, level = 0 }: PageTreeProps) {
    if (!nodes || nodes.length === 0) return null;

    return (
        <div className="space-y-0.5">
            {nodes.map((node) => (
                <div key={node.id}>
                    <Link
                        href={`/dashboard/doc/${node.id}`}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm
                            hover:bg-white/5 text-zinc-400 hover:text-zinc-200
                        `}
                        style={{ paddingLeft: `${(level * 12) + 12}px` }}
                    >
                        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            {node.children && node.children.length > 0 ? (
                                <ChevronDown className="w-3 h-3 text-zinc-600" />
                            ) : (
                                <FileText className="w-3 h-3 text-zinc-600" />
                            )}
                        </span>
                        <span className="text-lg leading-none">{node.emoji || "📄"}</span>
                        <span className="truncate">{node.title}</span>
                    </Link>
                    {node.children && node.children.length > 0 && (
                        <PageTree nodes={node.children} level={level + 1} />
                    )}
                </div>
            ))}
        </div>
    );
}
