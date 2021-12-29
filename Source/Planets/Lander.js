"use strict";
class Lander {
    constructor(itemHolderCargo, itemHolderLifeforms, killableCrew) {
        this.itemHolderCargo = itemHolderCargo || ItemHolder.fromMassMax(50);
        this.itemHolderLifeforms = itemHolderLifeforms || ItemHolder.fromMassMax(50);
        this.killableCrew = killableCrew || Killable.fromIntegrityMax(12);
    }
    static fromKillableCrew(killableCrew) {
        return new Lander(null, null, killableCrew);
    }
    static fromEntity(entity) {
        return entity.propertyByName(Lander.name);
    }
    cargoCurrentOverMax(world) {
        return this.itemHolderCargo.massOfAllItemsOverMax(world);
    }
    crewCurrentOverMax() {
        return this.killableCrew.integrityCurrentOverMax();
    }
    lifeformsCurrentOverMax(world) {
        return this.itemHolderLifeforms.massOfAllItemsOverMax(world);
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
