import { FileText, Settings } from "lucide-react";
import { NewDocButton } from "@/components/NewDocButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteDocButton } from "@/components/DeleteDocButton";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Get workspaces user belongs to
    const workspaces = await prisma.workspaceMember.findMany({
        where: { userId: session.user.id },
        include: { workspace: true }
    });

    const workspaceIds = workspaces.map((w: any) => w.workspaceId);

    // Get documents from those workspaces
    const documents = await prisma.document.findMany({
        where: { workspaceId: { in: workspaceIds } },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: { workspace: true }
    });

    const totalDocs = await prisma.document.count({
        where: { workspaceId: { in: workspaceIds } }
    });

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Добро пожаловать</h1>
                    <p className="text-zinc-400 mt-1">Выберите рабочее пространство или создайте новый документ.</p>
                </div>
                <NewDocButton />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Link href="/dashboard/all" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Все документы</h3>
                    <p className="text-sm text-zinc-400 mt-1">{totalDocs} документов в {workspaces.length} пространствах</p>
                </Link>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Активность</h3>
                    <p className="text-sm text-zinc-400 mt-1">Недавние обновления ваших документов</p>
                </div>

                <Link href="/dashboard/settings" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                        <Settings className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Настройки</h3>
                    <p className="text-sm text-zinc-400 mt-1">Профиль и рабочие пространства</p>
                </Link>
            </div>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Недавние документы</h2>
                    <Link href="/dashboard/all" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">См. все</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.length > 0 ? (
                        documents.map((doc: any) => (
                            <Link href={`/dashboard/doc/${doc.id}`} key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl shrink-0">{doc.emoji || "📄"}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-zinc-200 truncate group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-zinc-500 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                                                {doc.workspace?.name}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {doc.updatedAt.toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DeleteDocButton id={doc.id} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-white/10 rounded-xl">
                            У вас пока нет документов. Нажмите "Новый документ", чтобы начать!
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
