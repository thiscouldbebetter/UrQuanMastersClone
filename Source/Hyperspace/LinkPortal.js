"use strict";
class LinkPortal {
    constructor(name, posInSpace, destinationSpaceName, destinationPos) {
        this.name = name;
        this.posInSpace = posInSpace;
        this.destinationSpaceName = destinationSpaceName;
        this.destinationPos = destinationPos;
    }
    static fromEntity(entity) {
        return entity.propertyByName(LinkPortal.name);
    }
    collideWithPlayer(uwpe) {
        var universe = uwpe.universe;
        var world = uwpe.world;
        if (LinkPortal.fromEntity(uwpe.entity2) == null) {
            uwpe.entitiesSwap();
        }
        var entityPlayer = uwpe.entity;
        var entityLinkPortal = uwpe.entity2;
        var linkPortal = LinkPortal.fromEntity(entityLinkPortal);
        var spaceBeingEntered = linkPortal.destinationSpace(world);
        var playerLoc = entityPlayer.locatable().loc;
        var playerPosNext = linkPortal.destinationPos.clone();
        var playerDisposition = Disposition.fromPosOrientationAndPlaceName(playerPosNext, playerLoc.orientation.clone(), spaceBeingEntered.name);
        var placeHyperspace = new PlaceHyperspace(universe, spaceBeingEntered, null, // starsystemDeparted
        playerDisposition);
        world.placeNextSet(placeHyperspace);
    }
    destinationSpace(world) {
        var destinationSpace = (this.destinationSpaceName == "Paraspace")
            ? world.paraspace
            : world.hyperspace;
        return destinationSpace;
    }
    toEntity(radiusInHyperspace) {
        var collider = Sphere.fromRadius(radiusInHyperspace);
        var collidable = Collidable.from3 // todo
        (collider, [], null // this.collideWithPlayer
        );
        var boundable = Boundable.fromCollidable(collidable);
        var color = Color.Instances().Red; // todo
        var visual = VisualCircle.fromRadiusAndColorFill(radiusInHyperspace, color);
        var drawable = Drawable.fromVisual(visual);
        var locatable = Locatable.fromPos(this.posInSpace);
        var entity = new Entity(this.name, [
            boundable,
            collidable,
            drawable,
            this,
            locatable
        ]);
        return entity;
    }
    // Clonable.
    clone() {
        throw new Error("todo");
    }
    overwriteWith(other) {
        throw new Error("todo");
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return LinkPortal.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
