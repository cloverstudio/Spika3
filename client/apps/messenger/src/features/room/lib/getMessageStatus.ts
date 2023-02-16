type getMessageStatusProps = {
    seenCount: number;
    deliveredCount: number;
    totalUserCount: number;
};

export default function getMessageStatus({
    seenCount,
    deliveredCount,
    totalUserCount,
}: getMessageStatusProps) {
    if (seenCount === totalUserCount) {
        return "seen";
    }

    if (deliveredCount === totalUserCount) {
        return "delivered";
    }

    return "sent";
}
