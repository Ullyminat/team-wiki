"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addComment(pageId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    const comment = await prisma.comment.create({
        data: {
            pageId,
            userId: session.user.id,
            content,
        },
    });

    revalidatePath(`/dashboard/doc/${pageId}`);
    return comment;
}

export async function getComments(pageId: string) {
    return await prisma.comment.findMany({
        where: { pageId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: { createdAt: "asc" },
    });
}

export async function deleteComment(commentId: string, pageId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Не авторизован");

    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    if (!comment) throw new Error("Комментарий не найден");
    if (comment.userId !== session.user.id) throw new Error("Нет прав на удаление");

    await prisma.comment.delete({
        where: { id: commentId }
    });

    revalidatePath(`/dashboard/doc/${pageId}`);
    return { success: true };
}
