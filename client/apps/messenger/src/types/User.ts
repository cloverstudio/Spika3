type User = {
    id: number;
    telephoneNumber: string;
    telephoneNumberHashed: string;
    createdAt: number;
    displayName?: string;
    avatarUrl?: string;
    emailAddress?: string;
};

export default User;
