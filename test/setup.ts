import { before } from "mocha";
import chai from "chai";
import spies from "chai-spies";

before(() => {
    chai.use(spies);
});
