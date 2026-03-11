"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function register(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        throw new Error("Не все поля заполнены");
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    // Create a default workspace for the new user
    await prisma.workspace.create({
        data: {
            name: "Личное пространство",
            isPrivate: true,
            members: {
                create: {
                    userId: user.id,
                    role: "ADMIN"
                }
            }
        }
    });

    return { success: true };
}
