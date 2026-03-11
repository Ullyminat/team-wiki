"use client";

import { useEffect, useState, useTransition } from "react";
import { getAvailableWorkspaces, joinWorkspace } from "@/app/actions/workspace";
import { Compass, Users, FileText, Plus, Loader2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const data = await getAvailableWorkspaces();
                setWorkspaces(data);
            } catch (error) {
                toast.error("Ошибка при загрузке пространств");
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorkspaces();
    }, []);

    const handleJoin = (id: string) => {
        startTransition(async () => {
            try {
                await joinWorkspace(id);
                toast.success("Вы успешно вступили в пространство!");
                router.push(`/dashboard/ws/${id}`);
                router.refresh();
            } catch (error) {
                toast.error("Ошибка при вступлении");
            }
        });
    };

    const filteredWorkspaces = workspaces.filter(ws =>
        ws.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="flex-1 bg-zinc-950 text-white overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto p-8">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                            <Compass className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Обзор пространств</h1>
                    </div>
                    <p className="text-zinc-400">Находите интересные проекты и присоединяйтесь к командам.</p>
                </header>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-all placeholder-zinc-600"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-zinc-500 animate-pulse">Ищем доступные пространства...</p>
                    </div>
                ) : filteredWorkspaces.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <Compass className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">Доступных пространств не найдено.</p>
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="text-blue-400 text-sm mt-2 hover:underline"
                            >
                                Очистить поиск
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkspaces.map((ws) => (
                            <div
                                key={ws.id}
                                className="group bg-zinc-900 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all shadow-xl hover:shadow-blue-900/10"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                                        {ws.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-end text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {ws._count.members}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {ws._count.documents}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">{ws.name}</h3>
                                <p className="text-sm text-zinc-500 line-clamp-2 mb-6 min-h-[40px]">
                                    {ws.description || "У этого пространства пока нет описания, но оно открыто для новых участников."}
                                </p>
                                <button
                                    onClick={() => handleJoin(ws.id)}
                                    disabled={isPending}
                                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-all border border-white/10 hover:border-white/20 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Вступить
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
