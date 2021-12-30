"use strict";
class SystemTests extends TestFixture {
    constructor() {
        super(SystemTests.name);
    }
    tests() {
        var returnTests = [
            this.playFromStart
        ];
        return returnTests;
    }
    // Tests.
    playFromStart() {
        // todo
        Assert.isTrue(true);
    }
}
