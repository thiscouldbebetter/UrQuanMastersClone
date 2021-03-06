"use strict";
class Station {
    constructor(name, color, radiusOuter, factionName, posAsPolar) {
        this.name = name;
        this.color = color;
        this.radiusOuter = radiusOuter;
        this.factionName = factionName;
        this.posAsPolar = posAsPolar;
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    toEntity(primaryPos) {
        var pos = primaryPos.clone().add(this.posAsPolar.toCoords(Coords.create()));
        var visual = new VisualGroup([
            new VisualAnchor(new VisualCircle(this.posAsPolar.radius, null, Color.byName("Gray"), null), primaryPos, null // ?
            ),
            VisualRectangle.fromSizeAndColorFill(Coords.fromXY(1, 1).multiplyScalar(this.radiusOuter), this.color)
        ]);
        var collider = new Sphere(Coords.fromXY(0, 0), this.radiusOuter);
        var returnValue = new Entity(this.name, [
            CollidableHelper.fromCollider(collider),
            Drawable.fromVisual(visual),
            new Locatable(Disposition.fromPos(pos)),
            this
        ]);
        return returnValue;
    }
    // EntityProperty.
    finalize(u, w, p, e) { }
    initialize(u, w, p, e) { }
    updateForTimerTick(u, w, p, e) { }
}
