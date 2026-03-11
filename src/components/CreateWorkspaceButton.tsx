"use client";

import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { createWorkspace } from "@/app/actions/workspace";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function CreateWorkspaceButton() {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        const name = prompt("Введите название нового рабочего пространства:");
        if (!name || name.trim() === "") return;

        setIsPending(true);
        try {
            await createWorkspace(name.trim());
            toast.success("Новое пространство создано!");
            router.refresh(); // Refresh the sidebar
        } catch (error) {
            console.error(error);
            toast.error("Ошибка при создании пространства");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex w-full mt-2 items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            Создать пространство
        </button>
    );
}
