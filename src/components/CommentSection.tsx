"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment } from "@/app/actions/comment";
import { Send, Trash2, User, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface CommentProps {
    pageId: string;
    initialComments: any[];
    currentUserId?: string;
}

export function CommentSection({ pageId, initialComments, currentUserId }: CommentProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                await addComment(pageId, content);
                setContent("");
                toast.success("Комментарий добавлен");
            } catch (error) {
                toast.error("Ошибка при отправке");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить комментарий?")) return;

        try {
            await deleteComment(id, pageId);
            toast.success("Комментарий удален");
        } catch (error) {
            toast.error("Ошибка при удалении");
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-white/10 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                Обсуждение ({initialComments.length})
            </h3>

            <div className="space-y-6 mb-8">
                {initialComments.map((comment) => (
                    <div key={comment.id} className="group flex gap-4 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {comment.user?.image ? (
                                <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-zinc-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-200 text-sm">
                                    {comment.user?.name || "Пользователь"}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-tight font-medium">
                                        {new Date(comment.createdAt).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                    </span>
                                    {currentUserId === comment.userId && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Напишите что-нибудь..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all placeholder-zinc-600 min-h-[100px] hover:border-white/20"
                />
                <button
                    disabled={isPending || !content.trim()}
                    type="submit"
                    className="absolute bottom-4 right-4 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
}
