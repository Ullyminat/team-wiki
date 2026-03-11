const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@wiki.local' },
        update: {},
        create: {
            email: 'admin@wiki.local',
            name: 'Admin',
            password: hashedPassword,
        },
    });

    console.log('Пользователь по умолчанию создан:');
    console.log(`Email: admin@wiki.local`);
    console.log(`Пароль: admin123`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
