"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createDocument } from "@/app/actions/document";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function NewDocButton({ workspaceId }: { workspaceId?: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        setIsPending(true);
        try {
            const doc = await createDocument("Новый документ", workspaceId);
            toast.success("Документ успешно создан!");
            router.push(`/dashboard/doc/${doc.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Ошибка при создании документа");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Новый документ
        </button>
    );
}
