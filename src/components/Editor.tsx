"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamically import the editor to prevent hydration errors and SSR issues
const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

interface EditorProps {
    initialValue?: string;
    onChange?: (value: string | undefined) => void;
}

export function Editor({ initialValue = "", onChange }: EditorProps) {
    const [value, setValue] = useState<string | undefined>(initialValue);

    const handleChange = (val?: string) => {
        setValue(val);
        if (onChange) {
            onChange(val);
        }
    };

    return (
        <div data-color-mode="dark" className="w-full">
            <MDEditor
                value={value}
                onChange={handleChange}
                preview="live"
                height={600}
                autoFocus
                className="!bg-transparent focus:outline-none border-none prose prose-invert max-w-none"
            />
        </div>
    );
}
