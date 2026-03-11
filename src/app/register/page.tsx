"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { register } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await register(formData);
            if (res.success) {
                toast.success("Регистрация успешна! Теперь вы можете войти.");
                router.push("/login");
            }
        } catch (error: any) {
            toast.error(error.message || "Ошибка при регистрации");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
            <div className="w-full max-w-sm p-8 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

                <div className="mb-8 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6 group">
                        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-full h-full rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-inner">
                            <Image
                                src="/logo_v2.png"
                                alt="Logo"
                                fill
                                className="object-cover scale-110"
                            />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Team Wiki</h1>
                    <p className="text-zinc-500 text-sm mt-1 uppercase tracking-[0.15em] font-semibold">Knowledge Base</p>
                    <p className="text-zinc-500 text-xs mt-4">Создайте аккаунт для начала работы</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Имя</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-zinc-700"
                            placeholder="Иван Иванов"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-zinc-700"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Пароль</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-zinc-700"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2.5 mt-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] cursor-pointer disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Зарегистрироваться"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-zinc-500">Уже есть аккаунт? </span>
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Войти
                    </Link>
                </div>
            </div>
        </div>
    );
}
