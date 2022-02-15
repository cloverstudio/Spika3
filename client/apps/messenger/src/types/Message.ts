type Message = {
    id: number;
    fromUserId: number;
    roomId: number;
    messageBody: { text: string };
    deviceId: number;
    userId: number;
    type: string;
    createdAt: string;
    modifiedAt: string;
};

export default Message;
