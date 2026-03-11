"use client";

import { Editor } from "@/components/Editor";
import { useState, useTransition } from "react";
import { updateDocument, rollbackVersion, updateDocumentDetails } from "@/app/actions/document";
import { Save, Loader2, ArrowLeft, History, Settings, Tag, FolderTree, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { CommentSection } from "@/components/CommentSection";

interface Version {
    id: string;
    versionNumber: number;
    createdAt: Date;
    content: string;
}

interface DocEditorClientProps {
    id: string;
    initialTitle: string;
    initialContent: string;
    initialEmoji?: string;
    initialTags?: string[];
    initialParentId?: string | null;
    versions: Version[];
    workspaceDocuments: { id: string; title: string }[];
    initialComments: any[];
    currentUserId: string;
    userRole: string;
}

export default function DocEditorClient({
    id,
    initialTitle,
    initialContent,
    initialEmoji = "📄",
    initialTags = [],
    initialParentId = null,
    versions: initialVersions,
    workspaceDocuments,
    initialComments,
    currentUserId,
    userRole
}: DocEditorClientProps) {
    const [content, setContent] = useState(initialContent);
    const [title, setTitle] = useState(initialTitle);
    const [emoji, setEmoji] = useState(initialEmoji);
    const [tags, setTags] = useState(initialTags);
    const [parentId, setParentId] = useState(initialParentId);

    const [isPending, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(true);
    const [activeTab, setActiveTab] = useState<"settings" | "history" | null>(null);

    const isGuest = userRole === "GUEST";
    const isAdmin = userRole === "ADMIN";

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateDocument(id, content, title);
                setIsSaved(true);
                toast.success("Документ сохранен");
            } catch (error) {
                console.error("Save error:", error);
                toast.error("Ошибка при сохранении");
            }
        });
    };

    const handleUpdateDetails = async (updates: Partial<{ emoji: string, tags: string[], parentId: string | null }>) => {
        try {
            await updateDocumentDetails(id, updates);
            toast.success("Свойства обновлены");
        } catch (error) {
            toast.error("Ошибка при обновлении свойств");
        }
    };

    const handleRollback = async (versionId: string) => {
        if (!confirm("Вы уверены, что хотите откатиться к этой версии? Текущий прогресс будет потерян.")) return;

        try {
            await rollbackVersion(id, versionId);
            toast.success("Версия восстановлена");
            window.location.reload(); // Simplest way to refresh all state
        } catch (error) {
            toast.error("Ошибка при восстановлении");
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden">
            {/* Topbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-zinc-950/50 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={isGuest}
                            className={`text-2xl p-1 rounded transition-colors ${isGuest ? "cursor-default" : "hover:bg-white/5"}`}
                            onClick={() => {
                                const newEmoji = prompt("Введите эмодзи:", emoji);
                                if (newEmoji !== null) {
                                    setEmoji(newEmoji);
                                    handleUpdateDetails({ emoji: newEmoji });
                                }
                            }}
                        >
                            {emoji}
                        </button>
                        <input
                            type="text"
                            readOnly={isGuest}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setIsSaved(false);
                            }}
                            placeholder="Без названия"
                            className={`bg-transparent text-xl font-semibold focus:outline-none placeholder-zinc-600 w-64 md:w-96 text-zinc-100 ${isGuest ? "cursor-default" : ""}`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab(activeTab === "history" ? null : "history")}
                        className={`p-2 rounded-md transition-colors ${activeTab === "history" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                        title="История версий"
                    >
                        <History className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === "settings" ? null : "settings")}
                        className={`p-2 rounded-md transition-colors ${activeTab === "settings" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                        title="Настройки страницы"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    {!isGuest && (
                        <button
                            onClick={handleSave}
                            disabled={isPending || isSaved}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Сохранить
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto p-4 md:p-12">
                        <Editor
                            initialValue={content}
                            onChange={(val) => {
                                setContent(val || "");
                                setIsSaved(false);
                            }}
                        />

                        <CommentSection
                            pageId={id}
                            initialComments={initialComments}
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>

                {/* Right Panel */}
                {activeTab && (
                    <aside className="w-80 border-l border-white/10 bg-zinc-950 flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                                {activeTab === "history" ? <History className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                                {activeTab === "history" ? "История версий" : "Свойства страницы"}
                            </h3>
                            <button onClick={() => setActiveTab(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === "settings" && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <FolderTree className="w-3 h-3" /> Родительская страница
                                        </label>
                                        <select
                                            value={parentId || ""}
                                            onChange={(e) => {
                                                const val = e.target.value || null;
                                                setParentId(val);
                                                handleUpdateDetails({ parentId: val });
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="">Нет родителя</option>
                                            {workspaceDocuments.map(d => (
                                                <option key={d.id} value={d.id}>{d.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Tag className="w-3 h-3" /> Теги
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {tags.map((tag, idx) => (
                                                <span key={idx} className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                                                    {tag}
                                                    <button onClick={() => {
                                                        const newTags = tags.filter((_, i) => i !== idx);
                                                        setTags(newTags);
                                                        handleUpdateDetails({ tags: newTags });
                                                    }}><X className="w-2 h-2" /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Добавить тег... (Enter)"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if (val && !tags.includes(val)) {
                                                        const newTags = [...tags, val];
                                                        setTags(newTags);
                                                        handleUpdateDetails({ tags: newTags });
                                                        (e.target as HTMLInputElement).value = "";
                                                    }
                                                }
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "history" && (
                                <div className="space-y-3">
                                    {initialVersions.length === 0 && (
                                        <p className="text-sm text-zinc-500 text-center py-8">История версий пока пуста.</p>
                                    )}
                                    {initialVersions.map((v) => (
                                        <div key={v.id} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-blue-400">Версия #{v.versionNumber}</span>
                                                <button
                                                    onClick={() => handleRollback(v.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all shadow-sm"
                                                    title="Откатиться"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-zinc-500">
                                                {new Date(v.createdAt).toLocaleString('ru-RU')}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 italic">
                                                "{v.content.substring(0, 50)}..."
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
