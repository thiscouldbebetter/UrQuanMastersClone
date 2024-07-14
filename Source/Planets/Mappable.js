"use strict";
class Mappable {
    constructor(visual) {
        this.visual = visual;
    }
    static fromEntity(entity) {
        return entity.propertyByName(Mappable.name);
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Mappable.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) {
        return false; // todo
    }
}
