"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 transition-colors text-sm text-zinc-400 hover:text-red-400 group"
        >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Выйти
        </button>
    );
}
