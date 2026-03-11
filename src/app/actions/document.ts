"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function checkPermission(workspaceId: string, minRole: "GUEST" | "USER" | "ADMIN" = "USER") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    const membership = await prisma.workspaceMember.findFirst({
        where: { workspaceId, userId: session.user.id }
    });

    if (!membership) throw new Error("Нет доступа к пространству");

    const roleLevels = { GUEST: 0, USER: 1, ADMIN: 2 };
    const currentRole: "GUEST" | "USER" | "ADMIN" = membership.role as any;
    if (roleLevels[currentRole] < roleLevels[minRole]) {
        throw new Error("Недостаточно прав для выполнения операции");
    }

    return { userId: session.user.id, membership };
}

export async function createDocument(title: string, workspaceId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Не авторизован");
    }

    // If workspaceId is provided, verify membership
    let targetWorkspaceId = workspaceId;

    if (!targetWorkspaceId) {
        let workspaceMember = await prisma.workspaceMember.findFirst({
            where: { userId: session.user.id },
            include: { workspace: true }
        });

        // If no workspace, create a default one
        if (!workspaceMember) {
            const workspace = await prisma.workspace.create({
                data: {
                    name: "Мое пространство",
                    members: {
                        create: {
                            userId: session.user.id,
                            role: "ADMIN"
                        }
                    }
                }
            });
            targetWorkspaceId = workspace.id;
        } else {
            targetWorkspaceId = workspaceMember.workspaceId;
        }
    } else {
        const member = await prisma.workspaceMember.findFirst({
            where: { userId: session.user.id, workspaceId: targetWorkspaceId }
        });
        if (!member) throw new Error("Нет доступа к пространству");
    }

    const document = await prisma.document.create({
        data: {
            title,
            workspaceId: targetWorkspaceId,
            authorId: session.user.id,
            content: "Начните писать здесь..."
        },
    });

    revalidatePath(`/dashboard`, "layout");
    if (workspaceId) {
        revalidatePath(`/dashboard/ws/${workspaceId}`, "layout");
    }
    return document;
}

export async function updateDocument(id: string, content: string, title?: string) {
    const existingDoc = await prisma.document.findUnique({
        where: { id },
        select: { workspaceId: true, content: true }
    });
    if (!existingDoc) throw new Error("Документ не найден");

    const { userId } = await checkPermission(existingDoc.workspaceId, "USER");

    // Save version before updating, ONLY if content has changed
    if (existingDoc.content !== content) {
        const lastVersion = await prisma.pageVersion.findFirst({
            where: { pageId: id },
            orderBy: { versionNumber: "desc" }
        });

        const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

        await prisma.pageVersion.create({
            data: {
                pageId: id,
                versionNumber: nextVersionNumber,
                content: existingDoc.content || "",
                updatedBy: userId
            }
        });
    }

    const document = await prisma.document.update({
        where: { id },
        data: {
            content,
            ...(title && { title }),
        },
    });

    revalidatePath(`/dashboard/doc/${id}`);
    revalidatePath(`/dashboard`, "layout");
    return document;
}

export async function getDocument(id: string) {
    return await prisma.document.findUnique({
        where: { id },
    });
}

export async function deleteDocument(id: string) {
    const document = await prisma.document.findUnique({
        where: { id },
    });

    if (!document) {
        throw new Error("Документ не найден");
    }

    await checkPermission(document.workspaceId, "ADMIN"); // Only admins can delete

    await prisma.document.delete({
        where: { id },
    });

    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function getVersions(pageId: string) {
    return await prisma.pageVersion.findMany({
        where: { pageId },
        orderBy: { versionNumber: "desc" },
    });
}

export async function rollbackVersion(pageId: string, versionId: string) {
    const version = await prisma.pageVersion.findUnique({
        where: { id: versionId },
        include: { document: true }
    });

    if (!version || version.pageId !== pageId) throw new Error("Версия не найдена");

    const { userId } = await checkPermission(version.document.workspaceId, "USER");

    // Before rolling back, save the CURRENT state as a new version
    const lastVersion = await prisma.pageVersion.findFirst({
        where: { pageId },
        orderBy: { versionNumber: "desc" }
    });
    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await prisma.pageVersion.create({
        data: {
            pageId,
            versionNumber: nextVersionNumber,
            content: version.document.content || "",
            updatedBy: userId
        }
    });

    // Update document with selected version content
    await prisma.document.update({
        where: { id: pageId },
        data: { content: version.content }
    });

    revalidatePath(`/dashboard/doc/${pageId}`);
    revalidatePath(`/dashboard`, "layout");
    return { success: true };
}

export async function updateDocumentDetails(id: string, data: { emoji?: string | null, tags?: string[], parentId?: string | null }) {
    const document = await prisma.document.findUnique({
        where: { id },
        select: { workspaceId: true }
    });
    if (!document) throw new Error("Документ не найден");

    await checkPermission(document.workspaceId, "USER");

    await prisma.document.update({
        where: { id },
        data: {
            ...data
        }
    });

    revalidatePath(`/dashboard/doc/${id}`);
    revalidatePath(`/dashboard`, "layout");
    return { success: true };
}

export async function getWorkspaceDocuments(workspaceId: string) {
    return await prisma.document.findMany({
        where: { workspaceId, isArchived: false },
        select: { id: true, title: true }
    });
}

export async function searchDocuments(query: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    // Get user workspaces
    const members = await prisma.workspaceMember.findMany({
        where: { userId: session.user.id },
        select: { workspaceId: true }
    });
    const workspaceIds = members.map((m: { workspaceId: string }) => m.workspaceId);

    return await prisma.document.findMany({
        where: {
            workspaceId: { in: workspaceIds },
            isArchived: false,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                { tags: { has: query } }
            ]
        },
        include: { workspace: true },
        take: 10
    });
}
