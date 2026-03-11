"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment } from "@/app/actions/comment";
import { Send, Trash2, User, Loader2, Download, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { FileUploader } from "./Uploader";

interface CommentProps {
    pageId: string;
    initialComments: any[];
    currentUserId?: string;
}

const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);

    return parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (match) {
            const label = match[1];
            const url = match[2];
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(label) || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

            if (isImage) {
                return (
                    <span key={i} className="inline-block align-top mr-2 mb-2 max-w-[200px] rounded-xl overflow-hidden border border-white/10 group relative shadow-sm">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="block relative">
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 pointer-events-none flex items-center justify-center">
                                <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <img src={url} alt={label} className="w-full h-auto object-cover max-h-[160px] max-w-full" />
                        </a>
                    </span>
                );
            }

            return (
                <span key={i} className="inline-block align-top mr-2 mb-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all shadow-sm w-max no-underline">
                        <div className="p-1 bg-blue-500/10 rounded text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[160px] text-zinc-300 group-hover:text-blue-300 transition-colors">{label}</span>
                        <Download className="w-3.5 h-3.5 ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 text-blue-400" />
                    </a>
                </span>
            );
        }

        // Also parse raw urls just in case
        const urlParts = part.split(/(https?:\/\/[^\s]+)/g);
        return urlParts.map((uPart, j) => {
            if (uPart.match(/^https?:\/\/[^\s]+$/)) {
                return <a key={`${i}-${j}`} href={uPart} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline break-all transition-colors">{uPart}</a>;
            }
            // Preserve newlines, but handle trailing nicely
            return <span key={`${i}-${j}`} className="whitespace-pre-wrap text-zinc-100">{uPart}</span>;
        });
    });
};

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
                            <div className="text-zinc-400 text-sm mt-1.5 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                                {renderContent(comment.content)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="relative mt-2">
                <FileUploader onUploadSuccess={(url, originalName) => {
                    const fileMarkdown = originalName ? `[${originalName}](${url})` : url;
                    setContent(prev => {
                        const spacer = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
                        return prev + spacer + fileMarkdown + ' ';
                    });
                    toast.success("Файл прикреплен к тексту");
                }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Напишите комментарий... (или перетащите файлы сюда)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pb-14 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all placeholder-zinc-600 min-h-[120px] hover:border-white/20 custom-scrollbar"
                    />
                </FileUploader>
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                        disabled={isPending || !content.trim()}
                        type="submit"
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
