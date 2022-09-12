import { Device } from ".prisma/client";

type DeviceType = Omit<Device, "tokenExpiredAt"> & { tokenExpiredAt?: number };

export default DeviceType;
