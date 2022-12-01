import prisma from "../server/components/prisma";
import excel from "excel4node";

const workbook = new excel.Workbook();

const worksheet = workbook.addWorksheet("Sheet 1");

const style = workbook.createStyle({
    font: {
        color: "#000000",
        size: 9,
    },
});

const styleHeading = workbook.createStyle({
    font: {
        color: "#000000",
        size: 12,
        weight: 800,
    },
});

worksheet.cell(1, 2).string("This month").style(styleHeading);
worksheet.cell(1, 3).string("All time").style(styleHeading);

export default async function generateMonthlyReport(month: number, year: number) {
    if ((month !== 0 && !month) || month > 11) {
        throw Error("Month should be a number (0-11)");
    }

    if (!year || year === 0) {
        throw Error("Year should be a number");
    }

    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0);

    const thisMonthDateQuery = {
        createdAt: {
            gte: fromDate,
            lte: toDate,
        },
    };

    const measurements: any = {};

    const totalNumberOfUsers = await prisma.user.count({ where: { verified: true } });
    const newUsersThisMonth = await prisma.user.count({
        where: {
            verified: true,
            ...thisMonthDateQuery,
        },
    });

    measurements.users = [totalNumberOfUsers, newUsersThisMonth];

    const activeUsersThisMonth = await prisma.user.count({
        where: {
            verified: true,
            userActivities: {
                some: { name: "get_history", ...thisMonthDateQuery },
            },
        },
    });

    measurements.activeUsers = [totalNumberOfUsers, activeUsersThisMonth];

    const allRooms = await prisma.room.findMany({
        include: {
            _count: {
                select: {
                    messages: true,
                },
            },
        },
    });
    const newRoomsThisMonth = await prisma.room.findMany({
        where: thisMonthDateQuery,
        include: {
            _count: {
                select: {
                    messages: true,
                },
            },
        },
    });

    const totalNumberOfNonEmptyRooms = allRooms.filter((r) => r._count.messages > 0).length;
    const newNonEmptyRoomsThisMonth = newRoomsThisMonth.filter((r) => r._count.messages > 0).length;

    measurements.chatRooms = [totalNumberOfNonEmptyRooms, newNonEmptyRoomsThisMonth];

    const allMessagesCount = await prisma.message.count();
    const newMessagesThisMonth = await prisma.message.count({
        where: thisMonthDateQuery,
    });

    measurements.messages = [allMessagesCount, newMessagesThisMonth];
    const allTextMessagesCount = await prisma.message.count({ where: { type: "text" } });
    const newTextMessagesThisMonth = await prisma.message.count({
        where: { ...thisMonthDateQuery, type: "text" },
    });

    measurements.textMessages = [allTextMessagesCount, newTextMessagesThisMonth];

    const allImageMessagesCount = await prisma.message.count({ where: { type: "image" } });
    const newImageMessagesThisMonth = await prisma.message.count({
        where: { ...thisMonthDateQuery, type: "image" },
    });

    measurements.imageMessages = [allImageMessagesCount, newImageMessagesThisMonth];

    const allVideoMessagesCount = await prisma.message.count({ where: { type: "video" } });
    const newVideoMessagesThisMonth = await prisma.message.count({
        where: { ...thisMonthDateQuery, type: "video" },
    });
    measurements.videoMessages = [allVideoMessagesCount, newVideoMessagesThisMonth];

    const allFileMessagesCount = await prisma.message.count({ where: { type: "file" } });
    const newFileMessagesThisMonth = await prisma.message.count({
        where: { ...thisMonthDateQuery, type: "file" },
    });
    measurements.filesMessages = [allFileMessagesCount, newFileMessagesThisMonth];

    const allAudioMessagesCount = await prisma.message.count({ where: { type: "audio" } });
    const newAudioMessagesThisMonth = await prisma.message.count({
        where: { ...thisMonthDateQuery, type: "audio" },
    });

    measurements.audioMessages = [allAudioMessagesCount, newAudioMessagesThisMonth];

    console.log(fromDate.toLocaleDateString(), toDate.toLocaleDateString(), {
        totalNumberOfUsers,
        newUsersThisMonth,
        totalNumberOfNonEmptyRooms,
        newNonEmptyRoomsThisMonth,
        allMessagesCount,
        newMessagesThisMonth,
        allTextMessagesCount,
        newTextMessagesThisMonth,
        allImageMessagesCount,
        newImageMessagesThisMonth,
        allVideoMessagesCount,
        newVideoMessagesThisMonth,
        allFileMessagesCount,
        newFileMessagesThisMonth,
        allAudioMessagesCount,
        newAudioMessagesThisMonth,
    });

    Object.entries(measurements).map(([key, val], i) => {
        worksheet
            .cell(i + 2, 1)
            .string(key)
            .style(style);
        worksheet
            .cell(i + 2, 2)
            .number(val[1])
            .style(style);
        worksheet
            .cell(i + 2, 3)
            .number(val[0])
            .style(style);
    });
    workbook.write(`${__dirname}/${month}_${year}.xlsx`);
}
