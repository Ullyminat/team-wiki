"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, CheckCircle2, FileUp, Paperclip } from "lucide-react";

export function FileUploader({
    onUploadSuccess,
    children,
    className = ""
}: {
    onUploadSuccess: (url: string, originalName?: string) => void;
    children: React.ReactNode;
    className?: string;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            onUploadSuccess(data.url, data.originalName);
            return true;
        } catch (error) {
            console.error("Upload error:", error);
            return false;
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        let successCount = 0;

        const uploadPromises = Array.from(files).map(async (file) => {
            const success = await uploadFile(file);
            if (success) successCount++;
        });

        await Promise.all(uploadPromises);

        if (successCount > 0) {
            setUploadCount(successCount);
            setTimeout(() => setUploadCount(0), 3000);
        } else if (files.length > 0) {
            alert("Ошибка при загрузке файлов. Проверьте соединение с сервером.");
        }

        setIsUploading(false);
        // Reset input value to allow uploading the same file again
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const onDragLeave = () => {
        setIsDragActive(false);
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <div
            className={`relative group w-full ${className}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* The underlying content (e.g., textarea) */}
            {children}

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                disabled={isUploading}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
            />

            {/* Clickable paperclip button located at the bottom left relative to children */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-3 left-3 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                title="Прикрепить файл"
            >
                <Paperclip className="w-5 h-5" />
            </button>

            {/* Huge Overlay when Dragging */}
            {isDragActive && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-500 pointer-events-none transition-all duration-200 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    <FileUp className="w-12 h-12 text-blue-400 animate-bounce mb-3" />
                    <span className="font-semibold text-xl text-blue-400 tracking-tight">Отпустите файлы здесь</span>
                    <span className="text-zinc-400 text-sm mt-1">Они будут мгновенно загружены</span>
                </div>
            )}

            {/* Status indicators */}
            {isUploading && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 text-xs font-medium backdrop-blur-md shadow-lg">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Загрузка...
                </div>
            )}

            {uploadCount > 0 && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-xs font-medium backdrop-blur-md transition-opacity shadow-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Успешно: {uploadCount}
                </div>
            )}
        </div>
    );
}
