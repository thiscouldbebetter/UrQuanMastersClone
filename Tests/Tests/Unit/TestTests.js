"use strict";
class TestTests extends TestFixture {
    constructor() {
        super(TestTests.name);
    }
    tests() {
        var returnTests = [
            this.alwaysPass
        ];
        return returnTests;
    }
    // Tests.
    alwaysPass() {
        Assert.isTrue(true);
    }
}
