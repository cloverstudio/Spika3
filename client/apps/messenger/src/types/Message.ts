type Message = {
    id: number;
    fromUserId: number;
    roomId: number;
    messageBody: string;
    deviceId: number;
    userId: number;
    createdAt: string;
    modifiedAt: string;
};

export default Message;
