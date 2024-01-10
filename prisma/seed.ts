import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const user1 = await prisma.user.create({
        data: {
            displayName: 'Petra',
            webhookUrl: 'http://localhost:3102/petra/webhook',
            verified: true,
            isBot: true,
            device: {
                create: [
                    {
                        deviceId: "1",
                        type: 'bot',
                        deviceName: "bot",
                        osName: "bot",
                        osVersion: "bot",
                        appVersion: "bot",
                        token: "mE4gGSpfteJbt4PbqRAbl2ZLH7uCPUHS",
                        createdAt: new Date()
                    }
                ]
            }
        },
    })

    const user2 = await prisma.user.create({
        data: {
            displayName: 'Ana',
            webhookUrl: 'http://localhost:3102/ana/webhook',
            verified: true,
            isBot: true,
            device: {
                create: [
                    {
                        deviceId: "2",
                        type: 'bot',
                        deviceName: "bot",
                        osName: "bot",
                        osVersion: "bot",
                        appVersion: "bot",
                        token: "A6NA5htGEc70ZS1ocys1XpBEmdMXqWKe",
                        createdAt: new Date()
                    }
                ]
            }
        },
    })


}

(async () => {
    try {
        await main();
        await prisma.$disconnect()
    } catch (e) {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }
})()