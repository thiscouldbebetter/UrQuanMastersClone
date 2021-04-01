"use strict";
class Conversation {
    constructor(statements) {
        this.statements = statements;
        this.statementIndexCurrent = null;
        this.isDone = false;
        this._statementCurrent = new Reference(null);
        this.statementAdvance();
    }
    static demo() {
        var returnValue = new Conversation([
            "This is a test.",
            "This is only a test.",
            "How does that make you feel?",
        ]);
        return returnValue;
    }
    statementAdvance() {
        if (this.statementIndexCurrent == null) {
            this.statementIndexCurrent = 0;
        }
        else {
            this.statementIndexCurrent++;
        }
        if (this.statementIndexCurrent >= this.statements.length) {
            this.statementIndexCurrent = null;
            this.isDone = true;
        }
        return this.statementCurrent();
    }
    statementCurrent() {
        var statementNext = (this.isDone ? "[Done]" : this.statements[this.statementIndexCurrent]);
        this._statementCurrent.value = statementNext;
        return this._statementCurrent;
    }
}
