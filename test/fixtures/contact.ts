import { User } from "@prisma/client";

export default async function createFakeContacts({
    userId,
    contacts,
}: {
    userId: number;
    contacts: User[];
}) {
    return Promise.all(
        contacts.map(async (u) => {
            return global.prisma.contact.create({
                data: { userId, contactId: u.id },
            });
        })
    );
}
