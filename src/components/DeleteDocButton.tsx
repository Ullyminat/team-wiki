"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDocument } from "@/app/actions/document";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function DeleteDocButton({ id }: { id: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the document

        if (!confirm("Вы уверены, что хотите удалить этот документ?")) {
            return;
        }

        setIsPending(true);
        try {
            await deleteDocument(id);
            toast.success("Документ удален");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Ошибка при удалении");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
            title="Удалить документ"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    );
}
