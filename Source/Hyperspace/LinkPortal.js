"use strict";
class LinkPortal {
    constructor(name, posInHyperspace) {
        this.name = name;
        this.posInHyperspace = posInHyperspace;
    }
    static fromEntity(entity) {
        return entity.propertyByName(LinkPortal.name);
    }
    // Clonable.
    clone() {
        throw new Error("todo");
    }
    overwriteWith(other) {
        throw new Error("todo");
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Starsystem.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
