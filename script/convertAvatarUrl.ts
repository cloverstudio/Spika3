// convert rooms
import { PrismaClient, RoomUser, Room, User } from "@prisma/client";
const prisma: PrismaClient =
    global.prisma ||
    new PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
        ],
    });


(async () => {
    const rooms: Room[] = await prisma.room.findMany();

    for(let i = 0 ; i < rooms.length ; i++){
        const room = rooms[i];

        if(/^.*uploads.*$/i.test(room.avatarUrl)){

            const file = await prisma.file.findFirst({
                where: {
                    path: room.avatarUrl
                }
            });

            if(file){
                await prisma.room.update({
                    where: {
                        id: room.id
                    },
                    data:{
                        avatarFileId: file.id
                    }
                })
            }


        }
    }

    const users: User[] = await prisma.user.findMany();

    for(let i = 0 ; i < users.length ; i++){
        const user = users[i];

        if(/^.*uploads.*$/i.test(user.avatarUrl)){

            const file = await prisma.file.findFirst({
                where: {
                    path: user.avatarUrl
                }
            });

            if(file){
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data:{
                        avatarFileId: file.id
                    }
                })
            }


        }
    }


})();
