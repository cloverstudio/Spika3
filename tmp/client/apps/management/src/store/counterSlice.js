"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectCount = exports.incrementByAmount = exports.decrement = exports.increment = exports.counterSlice = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
exports.counterSlice = (0, toolkit_1.createSlice)({
    name: "counter",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: { value: 0 },
    reducers: {
        increment: function (state, action) {
            state.value += 1;
        },
        decrement: function (state, action) {
            state.value -= 1;
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        incrementByAmount: function (state, action) {
            state.value += action.payload;
        },
    },
});
exports.increment = (_a = exports.counterSlice.actions, _a.increment), exports.decrement = _a.decrement, exports.incrementByAmount = _a.incrementByAmount;
// Other code such as selectors can use the imported `RootState` type
var selectCount = function (state) { return state.counter.value; };
exports.selectCount = selectCount;
exports.default = exports.counterSlice.reducer;
//# sourceMappingURL=counterSlice.js.map