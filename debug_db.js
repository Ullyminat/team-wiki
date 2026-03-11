const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('All users in DB:', users);

    if (users.length > 0) {
        const isMatch = await bcrypt.compare('admin123', users[0].password);
        console.log('Does password match "admin123"?', isMatch);
    }
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
