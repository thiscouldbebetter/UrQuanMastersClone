"use strict";
class EnergySource {
    constructor(name, pos, visual, collideWithLander) {
        this.name = name;
        this.pos = pos;
        this.visual = visual;
        this.collideWithLander = collideWithLander;
    }
    static fromEntity(entity) {
        return entity.propertyByName(EnergySource.name);
    }
    toEntity(world, place) {
        var visual = VisualCircle.fromRadiusAndColorFill(10, Color.byName("Cyan"));
        visual = new VisualWrapped(place.size, visual);
        var energySourceCollider = new Sphere(Coords.create(), 5);
        var returnValue = new Entity(this.name, [
            this,
            Collidable.fromCollider(energySourceCollider),
            Drawable.fromVisual(visual),
            Locatable.fromPos(this.pos),
        ]);
        return returnValue;
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
