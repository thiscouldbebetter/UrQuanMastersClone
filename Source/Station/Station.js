"use strict";
class Station {
    constructor(name, color, radiusOuter, factionName, posAsPolar) {
        this.name = name;
        this.color = color;
        this.radiusOuter = radiusOuter;
        this.factionName = factionName;
        this.posAsPolar = posAsPolar;
    }
    static fromEntity(entity) {
        return entity.propertyByName(Station.name);
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    toEntity(primary, primaryPos) {
        var collider = new Sphere(Coords.fromXY(0, 0), this.radiusOuter);
        var collidable = Collidable.fromCollider(collider);
        var orbitColor = primary.orbitColor();
        var visual = new VisualGroup([
            new VisualAnchor(new VisualCircle(this.posAsPolar.radius, null, orbitColor, null), primaryPos, null // ?
            ),
            VisualRectangle.fromSizeAndColorFill(Coords.fromXY(1, 1).multiplyScalar(this.radiusOuter), this.color)
        ]);
        var drawable = Drawable.fromVisual(visual);
        var pos = primaryPos.clone().add(this.posAsPolar.toCoords(Coords.create()));
        var locatable = new Locatable(Disposition.fromPos(pos));
        var talker = new Talker("Conversation-" + this.name, null, this.toControl);
        var returnValue = new Entity(this.name, [
            collidable,
            drawable,
            locatable,
            this,
            talker
        ]);
        return returnValue;
    }
    // Controls.
    toControl(cr, size, universe) {
        return cr.toControl_Layout_2(size, universe);
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
