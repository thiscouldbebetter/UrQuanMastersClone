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
        var visualDetailed = new VisualWrapped(planet.sizeSurface, this.visual);
        var energySourceDrawable = Drawable.fromVisual(visualDetailed);
        var energySourceLocatable = Locatable.fromPos(this.pos);
        var visualScanContact = VisualPolygon.fromVerticesAndColorFill([
            Coords.fromXY(0, -dimension),
            Coords.fromXY(dimension, 0),
            Coords.fromXY(0, dimension),
            Coords.fromXY(-dimension, 0),
        ], Color.byName("Cyan"));
        visualScanContact = new VisualHidable((uwpe) => {
            var isVisible = false;
            var place = uwpe.place;
            var placeTypeName = place.constructor.name;
            if (placeTypeName == PlacePlanetOrbit.name) {
                var placePlanetOrbit = place;
                isVisible = placePlanetOrbit.hasEnergyBeenScanned;
            }
            else if (placeTypeName == PlacePlanetSurface.name) {
                var placePlanetSurface = place;
                var placePlanetOrbit = placePlanetSurface.placePlanetOrbit;
                isVisible = placePlanetOrbit.hasEnergyBeenScanned;
            }
            else {
                throw new Error("Unexpected placeTypeName: " + placeTypeName);
            }
            return isVisible;
        }, visualScanContact);
        var energySourceMappable = new Mappable(visualScanContact);
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
