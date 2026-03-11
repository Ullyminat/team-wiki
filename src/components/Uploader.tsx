"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

export function FileUploader({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            onUploadSuccess(data.url);
        } catch (error) {
            console.error(error);
            alert("Ошибка при загрузке файла");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <input
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept="image/*,.pdf,.doc,.docx"
            />
            <button
                disabled={isUploading}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? "Загрузка..." : "Прикрепить файл"}
            </button>
        </div>
    );
}
