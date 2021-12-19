"use strict";
class EnergySource {
    constructor(name, pos, visual, collideWithLander) {
        this.name = name;
        this.pos = pos;
        this.visual = visual;
        this.collideWithLander = collideWithLander;
    }
    toEntity(world, place) {
        var visual = VisualCircle.fromRadiusAndColorFill(10, Color.byName("Cyan"));
        visual = new VisualWrapped(place.size, visual);
        var energySourceCollider = new Sphere(Coords.create(), 5);
        var returnValue = new Entity(this.name, [
            this,
            CollidableHelper.fromCollider(energySourceCollider),
            Drawable.fromVisual(visual),
            Locatable.fromPos(this.pos),
        ]);
        return returnValue;
    }
    // EntityProperty.
    finalize(u, w, p, e) { }
    initialize(u, w, p, e) { }
    updateForTimerTick(u, w, p, e) { }
}
