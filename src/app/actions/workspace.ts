"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createWorkspace(name: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Не авторизован");
    }

    const workspace = await prisma.workspace.create({
        data: {
            name,
            members: {
                create: {
                    userId: session.user.id,
                    role: "ADMIN"
                }
            }
        }
    });

    revalidatePath(`/dashboard`);
    return workspace;
}

export async function getAvailableWorkspaces() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    // All workspaces where the user is NOT a member AND is NOT private
    const workspaces = await prisma.workspace.findMany({
        where: {
            isPrivate: false,
            members: {
                none: {
                    userId: session.user.id
                }
            }
        },
        include: {
            _count: {
                select: { members: true, documents: true }
            }
        },
        orderBy: { name: "asc" }
    });

    return workspaces;
}

export async function updateWorkspace(id: string, data: { name?: string, description?: string | null, isPrivate?: boolean }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    // Check if user is admin
    const membership = await prisma.workspaceMember.findFirst({
        where: { workspaceId: id, userId: session.user.id }
    });

    if (!membership || membership.role !== "ADMIN") {
        throw new Error("Только администратор может изменять настройки пространства");
    }

    const workspace = await prisma.workspace.update({
        where: { id },
        data
    });

    revalidatePath(`/dashboard`, "layout");
    revalidatePath(`/dashboard/settings`);
    return workspace;
}
export async function joinWorkspace(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    const membership = await prisma.workspaceMember.create({
        data: {
            workspaceId,
            userId: session.user.id,
            role: "MEMBER"
        }
    });

    revalidatePath(`/dashboard`, "layout");
    return membership;
}
