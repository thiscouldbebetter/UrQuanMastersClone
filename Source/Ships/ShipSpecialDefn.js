"use strict";
class ShipSpecialDefn {
    constructor(name, energyToUse, effectWhenInvoked) {
        this.name = name;
        this.energyToUse = energyToUse;
        this.effectWhenInvoked = effectWhenInvoked;
    }
    activate(universe, world, place, actor) {
        this.effectWhenInvoked(universe, world, place, actor);
    }
}
