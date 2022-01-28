"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var utils_1 = require("../../../../lib/utils");
function useDeviceId() {
    var _a = (0, react_1.useState)(""), deviceId = _a[0], setDeviceId = _a[1];
    (0, react_1.useEffect)(function () {
        if (!window.localStorage.getItem("deviceId")) {
            window.localStorage.setItem("deviceId", (0, utils_1.generateRandomString)(14));
        }
        setDeviceId(window.localStorage.getItem("deviceId"));
    }, []);
    return deviceId;
}
exports.default = useDeviceId;
//# sourceMappingURL=useDeviceId.js.map