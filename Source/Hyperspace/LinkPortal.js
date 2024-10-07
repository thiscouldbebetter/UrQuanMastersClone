"use strict";
class LinkPortal {
    constructor(name, posInSpace, destinationPlaceName, destinationPos) {
        this.name = name;
        this.posInSpace = posInSpace;
        this.destinationPlaceName = destinationPlaceName;
        this.destinationPos = destinationPos;
    }
    static fromEntity(entity) {
        return entity.propertyByName(LinkPortal.name);
    }
    collideWithPlayer(uwpe) {
        var universe = uwpe.universe;
        var world = uwpe.world;
        var place = world.place();
        if (LinkPortal.fromEntity(uwpe.entity2) == null) {
            uwpe.entitiesSwap();
        }
        var entityPlayer = uwpe.entity;
        var entityLinkPortal = uwpe.entity2;
        var linkPortal = LinkPortal.fromEntity(entityLinkPortal);
        var placeNext;
        if (this.destinationPlaceName.endsWith("space")) {
            var spaceBeingEntered = this.destinationPlaceName.startsWith("Hyper")
                ? world.hyperspace
                : world.paraspace;
            var playerLoc = entityPlayer.locatable().loc;
            var playerPosNext = linkPortal.destinationPos.clone();
            var playerDisposition = Disposition.fromPosOrientationAndPlaceName(playerPosNext, playerLoc.orientation.clone(), spaceBeingEntered.name);
            placeNext = new PlaceHyperspace(universe, spaceBeingEntered, null, // starsystemDeparted
            playerDisposition);
        }
        else if (this.destinationPlaceName.startsWith(Encounter.name)) {
            var factionName = this.destinationPlaceName.split("-")[1];
            var faction = world.factionByName(factionName);
            entityLinkPortal.propertyAdd(faction.toTalker());
            var playerPos = entityPlayer.locatable().loc.pos;
            var encounter = new Encounter(null, // planet
            factionName, entityPlayer, entityLinkPortal, place, // placeToReturnTo
            playerPos);
            var placeEncounter = encounter.toPlace();
            placeNext = placeEncounter;
        }
        else {
            throw new Error("Unrecognized value in .destinationPlaceName.");
        }
        world.placeNextSet(placeNext);
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
