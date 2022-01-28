"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sanitize(data) {
    return {
        user: function () {
            var id = data.id, emailAddress = data.emailAddress, telephoneNumber = data.telephoneNumber, telephoneNumberHashed = data.telephoneNumberHashed, displayName = data.displayName, avatarUrl = data.avatarUrl, createdAt = data.createdAt;
            return {
                id: id,
                emailAddress: emailAddress,
                telephoneNumber: telephoneNumber,
                telephoneNumberHashed: telephoneNumberHashed,
                displayName: displayName,
                avatarUrl: avatarUrl,
                createdAt: createdAt,
            };
        },
        room: function () {
            var id = data.id, type = data.type, name = data.name, avatarUrl = data.avatarUrl, users = data.users, createdAt = data.createdAt;
            return {
                id: id,
                type: type,
                name: name,
                avatarUrl: avatarUrl,
                users: users,
                createdAt: createdAt,
            };
        },
    };
}
exports.default = sanitize;
//# sourceMappingURL=sanitize.js.map