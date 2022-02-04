"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function useCountdownTimer(time) {
    var _a = (0, react_1.useState)(time), left = _a[0], setLeft = _a[1];
    var _b = (0, react_1.useState)(false), started = _b[0], setStarted = _b[1];
    (0, react_1.useEffect)(function () {
        if (started) {
            var t_1 = setInterval(function () {
                setLeft(function (left) {
                    if (left > 0) {
                        return left - 1;
                    }
                });
            }, 1000);
            return function () { return clearInterval(t_1); };
        }
    }, [started]);
    var start = function () {
        setLeft(time);
        setStarted(true);
    };
    return { left: left, start: start };
}
exports.default = useCountdownTimer;
//# sourceMappingURL=useCountdownTimer.js.map