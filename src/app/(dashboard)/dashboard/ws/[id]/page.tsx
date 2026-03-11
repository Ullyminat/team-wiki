import { FileText } from "lucide-react";
import { NewDocButton } from "@/components/NewDocButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { DeleteDocButton } from "@/components/DeleteDocButton";

export default async function WorkspacePage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const workspaceId = resolvedParams.id;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Verify user belongs to this workspace
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            userId: session.user.id,
            workspaceId: workspaceId
        },
        include: { workspace: true }
    });

    if (!membership) {
        return notFound();
    }

    const workspace = membership.workspace;

    // Get documents from THIS workspace
    const documents = await prisma.document.findMany({
        where: { workspaceId: workspaceId },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { workspace: true }
    });

    const totalDocs = await prisma.document.count({
        where: { workspaceId: workspaceId }
    });

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{workspace.name}</h1>
                    <p className="text-zinc-400 mt-1">Документы в этом рабочем пространстве.</p>
                </div>
                <NewDocButton workspaceId={workspace.id} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Все документы</h3>
                    <p className="text-sm text-zinc-400 mt-1">{totalDocs} документов</p>
                </div>
            </div>

            <section>
                <h2 className="text-xl font-semibold text-white mb-4">Недавние документы</h2>
                <div className="border border-white/10 bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                    {documents.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {documents.map((doc: any) => (
                                <Link href={`/dashboard/doc/${doc.id}`} key={doc.id} className="block hover:bg-white/5 transition-colors group">
                                    <div className="p-4 flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{doc.emoji || "📄"}</span>
                                            <div>
                                                <h4 className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                                <p className="text-xs text-zinc-500">
                                                    Обновлен {doc.updatedAt.toLocaleDateString('ru-RU')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DeleteDocButton id={doc.id} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-zinc-500">
                            В этом рабочем пространстве пока нет документов.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
