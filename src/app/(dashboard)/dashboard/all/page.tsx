import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Search, Filter } from "lucide-react";
import { DeleteDocButton } from "@/components/DeleteDocButton";
import { NewDocButton } from "@/components/NewDocButton";

export default async function AllDocumentsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Get workspaces user belongs to
    const workspaces = await prisma.workspaceMember.findMany({
        where: { userId: session.user.id },
        select: { workspaceId: true }
    });

    const workspaceIds = workspaces.map((w) => w.workspaceId);

    // Get ALL documents from those workspaces
    const documents = await prisma.document.findMany({
        where: {
            workspaceId: { in: workspaceIds },
            isArchived: false
        },
        orderBy: { updatedAt: "desc" },
        include: { workspace: true }
    });

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Все документы</h1>
                    <p className="text-zinc-400 mt-1">Полный список ваших знаний во всех пространствах.</p>
                </div>
                <div className="flex items-center gap-3">
                    <NewDocButton />
                </div>
            </header>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                        <Filter className="w-4 h-4" />
                        <span>{documents.length} документов найдено</span>
                    </div>
                </div>

                {documents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Название</th>
                                    <th className="px-6 py-4 font-semibold">Пространство</th>
                                    <th className="px-6 py-4 font-semibold">Обновлено</th>
                                    <th className="px-6 py-4 font-semibold text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/doc/${doc.id}`} className="flex items-center gap-3">
                                                <span className="text-2xl">{doc.emoji || "📄"}</span>
                                                <span className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                                                    {doc.title}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {doc.workspace?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {doc.updatedAt.toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DeleteDocButton id={doc.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Документов не найдено</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto">
                            Похоже, у вас пока нет созданных документов. Самое время что-нибудь написать!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
