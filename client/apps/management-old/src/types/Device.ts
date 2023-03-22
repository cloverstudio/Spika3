import { Device } from ".prisma/client";

type DeviceType = Partial<
    Omit<Device, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

export default DeviceType;

export type DeviceListType = {
    list: DeviceType[];
    count: number;
    limit: number;
};
