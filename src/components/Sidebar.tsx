import Link from "next/link";
import Image from "next/image";
import { BookOpen, Home, Settings, Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CreateWorkspaceButton } from "./CreateWorkspaceButton";
import { SearchBar } from "./SearchBar";
import { WorkspaceSection } from "./WorkspaceSection";
import { LogoutButton } from "./LogoutButton";

export async function Sidebar() {
    const session = await auth();
    let workspaceData: any[] = [];

    if (session?.user?.id) {
        // Fetch workspaces AND their documents
        const members = await prisma.workspaceMember.findMany({
            where: { userId: session.user.id },
            include: {
                workspace: {
                    include: {
                        documents: {
                            where: { parentId: null, isArchived: false },
                            orderBy: { title: "asc" },
                            include: {
                                children: {
                                    include: {
                                        children: {
                                            include: {
                                                children: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        });
        workspaceData = members.map((m: any) => m.workspace);
    }

    return (
        <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col h-screen text-zinc-300">
            <div className="p-4 flex items-center gap-3 border-b border-white/10 group cursor-default">
                <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-blue-600/20 to-transparent group-hover:scale-105 transition-transform duration-300">
                    <Image
                        src="/logo_v2.png"
                        alt="Logo"
                        fill
                        className="object-cover scale-110"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-white tracking-tight leading-none text-lg">Team Wiki</span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] mt-0.5">Knowledge Base</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
                <SearchBar />

                <div className="space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-zinc-300 hover:text-white"
                    >
                        <Home className="w-4 h-4" />
                        Главная
                    </Link>
                    <Link
                        href="/dashboard/all"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-zinc-300 hover:text-white"
                    >
                        <BookOpen className="w-4 h-4" />
                        Все документы
                    </Link>
                    <Link
                        href="/dashboard/explore"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-zinc-300 hover:text-white"
                    >
                        <Compass className="w-4 h-4" />
                        Обзор
                    </Link>
                </div>

                <div className="pt-4 pb-2">
                    <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Рабочие пространства
                    </p>
                </div>

                {workspaceData.map((ws, i) => {
                    const colors = [
                        "bg-emerald-500/20 text-emerald-500",
                        "bg-blue-500/20 text-blue-500",
                        "bg-purple-500/20 text-purple-500",
                        "bg-orange-500/20 text-orange-500",
                        "bg-pink-500/20 text-pink-500",
                    ];
                    const colorClass = colors[i % colors.length];
                    const char = ws.name.charAt(0).toUpperCase();

                    return (
                        <WorkspaceSection
                            key={ws.id}
                            workspace={ws}
                            colorClass={colorClass}
                        />
                    )
                })}

                <CreateWorkspaceButton />
            </nav>

            <div className="p-4 border-t border-white/10 mt-auto">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm"
                >
                    <Settings className="w-4 h-4" />
                    Настройки
                </Link>
                <LogoutButton />
            </div>
        </aside>
    );
}
