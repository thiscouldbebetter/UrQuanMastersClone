"use strict";
class Lander {
    constructor(itemHolderCargo, itemHolderLifeforms, killableCrew) {
        this.itemHolderCargo = itemHolderCargo || ItemHolder.fromEncumbranceMax(50);
        this.itemHolderLifeforms = itemHolderLifeforms || ItemHolder.fromEncumbranceMax(50);
        this.killableCrew = killableCrew || Killable.fromIntegrityMax(12);
    }
    static fromKillableCrew(killableCrew) {
        return new Lander(null, null, killableCrew);
    }
    static fromEntity(entity) {
        return entity.propertyByName(Lander.name);
    }
    cargoCurrentOverMax(world) {
        return this.itemHolderCargo.encumbranceOfAllItemsOverMax(world);
    }
    crewCurrentOverMax() {
        return this.killableCrew.integrityCurrentOverMax();
    }
    lifeformsCurrentOverMax(world) {
        return this.itemHolderLifeforms.encumbranceOfAllItemsOverMax(world);
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Lander.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
