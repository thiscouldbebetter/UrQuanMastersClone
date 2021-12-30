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
        var collider = new Sphere(Coords.fromXY(0, 0), this.radiusOuter);
        var collidable = Collidable.fromCollider(collider);
        var visual = new VisualGroup([
            new VisualAnchor(new VisualCircle(this.posAsPolar.radius, null, Color.byName("Gray"), null), primaryPos, null // ?
            ),
            VisualRectangle.fromSizeAndColorFill(Coords.fromXY(1, 1).multiplyScalar(this.radiusOuter), this.color)
        ]);
        var drawable = Drawable.fromVisual(visual);
        var pos = primaryPos.clone().add(this.posAsPolar.toCoords(Coords.create()));
        var locatable = new Locatable(Disposition.fromPos(pos));
        var talker = Talker.fromConversationDefnName("Conversation-EarthStation");
        var returnValue = new Entity(this.name, [
            collidable,
            drawable,
            locatable,
            this,
            talker
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
