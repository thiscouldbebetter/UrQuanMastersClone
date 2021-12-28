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
        var resourceDefn = ResourceDefn.byName(resourceDefnName);
        var resourceColor = resourceDefn.color;
        var resourceGradient = new ValueBreakGroup([
            new ValueBreak(0, resourceColor), new ValueBreak(1, Color.byName("Black"))
        ], null);
        var resourceRadius = resourceRadiusBase * Math.sqrt(resourceQuantity);
        var resourceVisual = new VisualCircleGradient(resourceRadius, resourceGradient, null);
        var camera = place.camera();
        if (camera != null) {
            resourceVisual = new VisualWrapped(place.planet.sizeSurface, resourceVisual);
        }
        var resourcePos = resource.pos;
        var resourceCollider = new Sphere(new Coords(0, 0, 0), resourceRadius);
        var resourceEntity = new Entity("Resource" + Math.random(), [
            new Item(resourceDefnName, resourceQuantity),
            Locatable.fromPos(resourcePos),
            Collidable.fromCollider(resourceCollider),
            Drawable.fromVisual(resourceVisual)
        ]);
        return resourceEntity;
    }
}
