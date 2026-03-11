import DocEditorClient from "./DocEditorClient";
import { getDocument, getVersions, getWorkspaceDocuments } from "@/app/actions/document";
import { getComments } from "@/app/actions/comment";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface PageProps {
    params: {
        id: string;
    }
}

export default async function DocumentEditorPage({ params }: PageProps) {
    // Await params in Next.js 15+
    const resolvedParams = await params;

    // Validate session
    const session = await auth();
    if (!session?.user?.id) {
        return notFound();
    }

    // Fetch the document
    const doc = await getDocument(resolvedParams.id);

    // Ensure document exists and user has access (simplified access control for now)
    if (!doc) {
        return notFound();
    }

    // Fetch versions, comments, other workspace docs and USER ROLE
    const [versions, otherDocs, comments, membership] = await Promise.all([
        getVersions(doc.id),
        getWorkspaceDocuments(doc.workspaceId),
        getComments(doc.id),
        prisma.workspaceMember.findFirst({
            where: { workspaceId: doc.workspaceId, userId: session.user.id }
        })
    ]);

    if (!membership) return notFound();

    return (
        <DocEditorClient
            id={doc.id}
            initialTitle={doc.title}
            initialContent={doc.content || ""}
            initialEmoji={doc.emoji || "📄"}
            initialTags={doc.tags || []}
            initialParentId={doc.parentId}
            userRole={membership.role}
            versions={versions.map((v: any) => ({
                id: v.id,
                versionNumber: v.versionNumber,
                createdAt: v.createdAt,
                content: v.content
            }))}
            workspaceDocuments={otherDocs.map((d: any) => ({
                id: d.id,
                title: d.title
            }))}
            initialComments={comments}
            currentUserId={session.user.id}
        />
    );
}
