import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings, User, Shield, CreditCard, Bell, Globe } from "lucide-react";
import { WorkspaceSettingsSection } from "@/components/WorkspaceSettingsSection";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            workspaces: {
                include: { workspace: true }
            }
        }
    });

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight">Настройки</h1>
                <p className="text-zinc-400 mt-1">Управляйте своим профилем и настройками приложения.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <nav className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium transition-colors">
                        <User className="w-4 h-4" />
                        Профиль
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
                        <Globe className="w-4 h-4" />
                        Воркспейсы
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
                        <Shield className="w-4 h-4" />
                        Безопасность
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
                        <Bell className="w-4 h-4" />
                        Уведомления
                    </button>
                </nav>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-8">
                    {/* Profile Section */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white">Профиль пользователя</h3>
                            <p className="text-sm text-zinc-500">Ваша персональная информация.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Имя</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name || ""}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
                                    <input
                                        type="email"
                                        readOnly
                                        defaultValue={user?.email || ""}
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-500 cursor-not-allowed focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-end">
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                                    Сохранить изменения
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Workspaces Section */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white">Ваши рабочие пространства</h3>
                            <p className="text-sm text-zinc-500">Настройки приватности и описание для ваших пространств.</p>
                        </div>
                        <div className="divide-y divide-white/5">
                            {user?.workspaces.map((m: any) => (
                                <WorkspaceSettingsSection
                                    key={m.id}
                                    workspace={m.workspace}
                                    role={m.role}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
