"use client";

import { useState, useTransition } from "react";
import { updateWorkspace } from "@/app/actions/workspace";
import { Shield, ShieldOff, Loader2, Info } from "lucide-react";
import { toast } from "react-toastify";

interface WorkspaceSettingsSectionProps {
    workspace: {
        id: string;
        name: string;
        description: string | null;
        isPrivate: boolean;
    };
    role: string;
}

export function WorkspaceSettingsSection({ workspace, role }: WorkspaceSettingsSectionProps) {
    const [isPrivate, setIsPrivate] = useState(workspace.isPrivate);
    const [name, setName] = useState(workspace.name);
    const [description, setDescription] = useState(workspace.description || "");
    const [isPending, startTransition] = useTransition();

    const isAdmin = role === "ADMIN";

    const handleUpdate = () => {
        startTransition(async () => {
            try {
                await updateWorkspace(workspace.id, {
                    name,
                    description: description || null,
                    isPrivate
                });
                toast.success("Настройки пространства обновлены");
            } catch (error: any) {
                toast.error(error.message || "Ошибка при обновлении");
            }
        });
    };

    if (!isAdmin) {
        return (
            <div className="p-6 flex items-center justify-between opacity-70">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center font-bold text-blue-400 text-xl">
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-medium text-white">{workspace.name}</h4>
                        <p className="text-xs text-zinc-500">Роль: {role} • {workspace.isPrivate ? "Приватное" : "Публичное"}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4 border-b border-white/5 last:border-0">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center font-bold text-blue-400 text-xl">
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-medium text-white">{workspace.name}</h4>
                        <p className="text-xs text-zinc-500">Настройки администратора</p>
                    </div>
                </div>
                <button
                    onClick={handleUpdate}
                    disabled={isPending}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-all disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Сохранить"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Название</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Приватность</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isPrivate
                                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                }`}
                        >
                            {isPrivate ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {isPrivate ? "Приватное" : "Публичное"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                    <Info className="w-3 h-3" /> Описание
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Расскажите об этом пространстве..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[60px] resize-none"
                />
            </div>

            {!workspace.isPrivate && isPrivate && (
                <p className="text-[10px] text-zinc-500 bg-black/20 p-2 rounded border border-white/5">
                    После изменения на приватное, это пространство перестанет отображаться в списке «Обзор» для других пользователей.
                </p>
            )}
        </div>
    );
}
