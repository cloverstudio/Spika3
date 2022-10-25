import { File } from "@prisma/client";
import faker from "faker";

export default async function createFakeFile(overrides?: any): Promise<File> {
    return global.prisma.file.create({
        data: {
            type: "type",
            relationId: faker.datatype.number({ min: 1, max: 500 }),
            path: "path",
            mimeType: "mimeType",
            fileName: "fileName",
            size: faker.datatype.number({ min: 500, max: 1000 }),
            clientId: faker.datatype.string(20),
            ...overrides,
        },
    });
}
