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
    toEntity(world, planet) {
        var dimension = 5;
        var energySourceCollider = new Sphere(Coords.create(), dimension);
        var energySourceCollidable = Collidable.fromCollider(energySourceCollider);
        var visual = VisualPolygon.fromVerticesAndColorFill([
            Coords.fromXY(0, -dimension),
            Coords.fromXY(dimension, 0),
            Coords.fromXY(0, dimension),
            Coords.fromXY(-dimension, 0),
        ], Color.byName("Cyan"));
        visual = new VisualWrapped(planet.sizeSurface, visual);
        var energySourceDrawable = Drawable.fromVisual(visual);
        var energySourceLocatable = Locatable.fromPos(this.pos);
        var energySourceVisualOnMinimap = new VisualImageFromLibrary(EnergySource.name + "MauluskaOrphan");
        var energySourceMappable = new Mappable(energySourceVisualOnMinimap);
        var returnValue = new Entity(this.name, [
            energySourceCollidable,
            energySourceDrawable,
            this,
            energySourceLocatable,
            energySourceMappable
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
