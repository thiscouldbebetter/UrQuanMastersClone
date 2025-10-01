"use strict";
class Lander extends EntityPropertyBase {
    constructor(itemHolderCargo, itemHolderDevices, itemHolderLifeforms, killableCrew) {
        super();
        this.itemHolderCargo =
            itemHolderCargo || ItemHolder.fromEncumbranceMax(50);
        this.itemHolderDevices =
            itemHolderDevices || ItemHolder.default();
        this.itemHolderLifeforms =
            itemHolderLifeforms || ItemHolder.fromEncumbranceMax(50);
        this.killableCrew =
            killableCrew || Killable.fromIntegrityMax(12);
    }
    static fromKillableCrew(killableCrew) {
        return new Lander(null, null, null, killableCrew);
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
}
