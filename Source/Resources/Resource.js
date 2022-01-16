"use strict";
class Resource {
    constructor(defnName, quantity, pos) {
        this.defnName = defnName;
        this.quantity = quantity;
        this.pos = pos;
    }
    toEntity(world, place, resourceRadiusBase) {
        var resource = this;
        var resourceQuantity = resource.quantity;
        var resourceDefnName = resource.defnName;
        var resourceRadius = resourceRadiusBase * Math.sqrt(resourceQuantity);
        var resourceCollider = new Sphere(Coords.zeroes(), resourceRadius);
        var resourceCollidable = Collidable.fromCollider(resourceCollider);
        var resourceDefn = ResourceDefn.byName(resourceDefnName);
        var resourceItem = new Item(resourceDefnName, resourceQuantity);
        var resourceColor = resourceDefn.color;
        var resourceGradient = new ValueBreakGroup([
            new ValueBreak(0, resourceColor),
            new ValueBreak(1, Color.byName("Black"))
        ], null);
        var resourceVisual = new VisualCircleGradient(resourceRadius, resourceGradient, null);
        var camera = place.camera();
        if (camera != null) {
            resourceVisual = new VisualWrapped(place.planet.sizeSurface, resourceVisual);
        }
        var resourceDrawable = Drawable.fromVisual(resourceVisual);
        var resourcePos = resource.pos;
        var resourceLocatable = Locatable.fromPos(resourcePos);
        var visualScanContact = new VisualCircleGradient(resourceRadius / 2, resourceGradient, null);
        visualScanContact = new VisualHidable((uwpe) => {
            var isVisible = false;
            var place = uwpe.place;
            var placeTypeName = place.constructor.name;
            if (placeTypeName == PlacePlanetOrbit.name) {
                var placePlanetOrbit = place;
                isVisible = placePlanetOrbit.haveMineralsBeenScanned;
            }
            else if (placeTypeName == PlacePlanetSurface.name) {
                var placePlanetSurface = place;
                var placePlanetOrbit = placePlanetSurface.placePlanetOrbit;
                isVisible = placePlanetOrbit.haveMineralsBeenScanned;
            }
            else {
                throw new Error("Unexpected placeTypeName: " + placeTypeName);
            }
            return isVisible;
        }, visualScanContact);
        var resourceMappable = new Mappable(visualScanContact);
        var resourceEntity = new Entity(Resource.name + Math.random(), [
            resourceCollidable,
            resourceDrawable,
            resourceItem,
            resourceLocatable,
            resourceMappable
        ]);
        return resourceEntity;
    }
}
