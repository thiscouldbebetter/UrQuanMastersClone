"use strict";
class Fuelable {
    // EntityProperty.
    finalize(u, w, p, e) { }
    initialize(u, w, p, e) { }
    updateForTimerTick(universe, world, place, entityFuelable) {
        var entityLoc = entityFuelable.locatable().loc;
        var entityVel = entityLoc.vel;
        var entitySpeed = entityVel.magnitude();
        var fuelConsumedPerSpeed = .1;
        if (entitySpeed > 0) {
            var flagship = world.player.flagship;
            var fuelToConsume = entitySpeed * fuelConsumedPerSpeed;
            if (flagship.fuel >= fuelToConsume) {
                flagship.fuel -= fuelToConsume;
            }
            else {
                flagship.fuel = 0;
            }
        }
    }
}
