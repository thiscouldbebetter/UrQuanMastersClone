"use strict";
class EnergySource extends EntityPropertyBase {
    constructor(name, pos, visual, itemDefn, collideWithLander) {
        super();
        this.name = name;
        this.pos = pos;
        this.visual = visual;
        this.itemDefn = itemDefn;
        this._collideWithLander = collideWithLander;
    }
    static Instances() {
        if (this._instances == null) {
            this._instances = new EnergySource_Instances();
        }
        return this._instances;
    }
    static fromEntity(entity) {
        return entity.propertyByName(EnergySource.name);
    }
    toItemDefn() {
        return this.itemDefn;
    }
    collideWithLander(uwpe) {
        this._collideWithLander(uwpe);
    }
    toEntity(world, planet) {
        var dimension = 5;
        var collider = Sphere.fromRadius(dimension);
        var collidable = Collidable.fromCollider(collider);
        var visualDetailed = new VisualWrapped2(planet.sizeSurface(), this.visual);
        var drawable = Drawable.fromVisual(visualDetailed);
        var item = Item.fromDefnName(this.name);
        var locatable = Locatable.fromPos(this.pos);
        var visualScanContact = VisualPolygon.fromVerticesAndColorFill([
            Coords.fromXY(0, -dimension),
            Coords.fromXY(dimension, 0),
            Coords.fromXY(0, dimension),
            Coords.fromXY(-dimension, 0),
        ], Color.Instances().Cyan);
        visualScanContact = new VisualHidable(this.toEntity_IsVisible, visualScanContact);
        var mappable = new Mappable(visualScanContact);
        var returnValue = Entity.fromNameAndProperties(this.name, [
            collidable,
            drawable,
            this, // energySource
            item,
            locatable,
            mappable
        ]);
        return returnValue;
    }
    toEntity_IsVisible(uwpe) {
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
    }
    ;
    // Clonable.
    clone() { throw new Error("todo"); }
    overwriteWith(other) { throw new Error("todo"); }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return EnergySource.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
class EnergySource_Instances {
    constructor() {
        var es = EnergySource;
        var posNone = null;
        var itemDefnNone = null;
        var vifl = VisualImageFromLibrary;
        this.AbandonedMoonbase = new es("AbandonedMoonbase", posNone, new vifl(EnergySource.name + "AbandonedMoonbase"), itemDefnNone, this.abandonedMoonbase_CollideWithLander);
        this.CrashedShackler = new es("CrashedShackler", posNone, new vifl(EnergySource.name + "CrashedShackler"), this.crashedShackler_ItemDefn(), this.crashedShackler_CollideWithLander);
        this.MauluskaOrphan = new es("MauluskaOrphan", posNone, new vifl(EnergySource.name + "MauluskaOrphan"), itemDefnNone, this.mauluskaOrphan_CollideWithLander);
        this.TtorstingCaster = new es("TtorstingCaster", posNone, new vifl(EnergySource.name + "TtorstingCaster"), this.ttorstingCaster_ItemDefn(), this.ttorstingCaster_CollideWithLander);
        this._All =
            [
                this.AbandonedMoonbase,
                this.CrashedShackler,
                this.MauluskaOrphan,
                this.TtorstingCaster
            ];
    }
    abandonedMoonbase_CollideWithLander(uwpe) {
        var universe = uwpe.universe;
        var acknowledgeReport = () => {
            var place = uwpe.place;
            place.exit(uwpe);
        };
        var venueToReturnTo = universe.venueCurrent();
        var mediaLibrary = universe.mediaLibrary;
        var abandonedMoonbaseMessage = mediaLibrary.textStringGetByName(EnergySource.name + "AbandonedMoonbase").value;
        var venueMessage = VenueMessage.fromTextAcknowledgeAndVenuePrev(abandonedMoonbaseMessage, acknowledgeReport, venueToReturnTo);
        universe.venueTransitionTo(venueMessage);
    }
    crashedShackler_CollideWithLander(uwpe) {
        const textCrashedShackler = "CrashedShackler";
        var universe = uwpe.universe;
        var acknowledgeReport = (uwpe) => {
            var place = uwpe.place;
            var entityPlayer = place.entityByName(Player.name);
            var lander = Lander.fromEntity(entityPlayer);
            var entityEnergySource = place.entityByName(textCrashedShackler);
            lander.itemHolderDevices.itemEntityPickUpFromPlace(entityEnergySource, place);
            place.exit(uwpe);
        };
        var venueToReturnTo = universe.venueCurrent();
        var mediaLibrary = universe.mediaLibrary;
        var message = mediaLibrary.textStringGetByName(EnergySource.name + textCrashedShackler).value;
        var venueMessage = VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);
        universe.venueTransitionTo(venueMessage);
    }
    crashedShackler_ItemDefn() {
        return ItemDefn.fromName("CrashedShackler");
    }
    mauluskaOrphan_CollideWithLander(uwpe) {
        const textMauluskaOrphan = "MauluskaOrphan";
        var universe = uwpe.universe;
        var acknowledgeReport = (uwpe) => {
            var place = uwpe.place;
            var entityPlayer = place.entityByName(Player.name);
            // var lander = Lander.fromEntity(entityPlayer);
            // var entityEnergySource = place.entityByName(textMauluskaOrphan);
            // todo - Remove the ship from the planet surface.
            place.exit(uwpe);
            var world = uwpe.world;
            const textMauluska = "Mauluska";
            var factionMauluska = world.factionByName(textMauluska);
            uwpe
                .placeSet(place.placePlanetOrbit)
                .entitySet(entityPlayer);
            // .entity2Set(entityEnergySource); // This makes the talking fail.
            var encounter = factionMauluska.toEncounter(uwpe);
            var placeEncounter = encounter.toPlace();
            world.placeNextSet(placeEncounter);
        };
        var venueToReturnTo = universe.venueCurrent();
        var mediaLibrary = universe.mediaLibrary;
        var message = mediaLibrary.textStringGetByName(EnergySource.name + textMauluskaOrphan).value;
        var venueMessage = VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);
        universe.venueTransitionTo(venueMessage);
    }
    ttorstingCaster_CollideWithLander(uwpe) {
        const textTtorstingCaster = "TtorstingCaster";
        var universe = uwpe.universe;
        var acknowledgeReport = (uwpe) => {
            var place = uwpe.place;
            var entityPlayer = place.entityByName(Player.name);
            var lander = Lander.fromEntity(entityPlayer);
            var entityEnergySource = place.entityByName(textTtorstingCaster);
            lander.itemHolderDevices.itemEntityPickUpFromPlace(entityEnergySource, place);
            place.exit(uwpe);
        };
        var venueToReturnTo = universe.venueCurrent();
        var mediaLibrary = universe.mediaLibrary;
        var message = mediaLibrary.textStringGetByName(EnergySource.name + textTtorstingCaster).value;
        var venueMessage = VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);
        universe.venueTransitionTo(venueMessage);
    }
    ttorstingCaster_ItemDefn() {
        return ItemDefn.fromNameAndUse("TtorstingCaster", this.ttorstingCaster_Use);
    }
    ttorstingCaster_Use(uwpe) {
        var world = uwpe.world;
        var place = world.place();
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlaceHyperspace.name) {
            var placeHyperspace = place;
            var factionMurch = world.factionByName("Murch");
            var shipGroupDistance = 20; // hack
            var randomizer = uwpe.universe.randomizer;
            var shipGroupDisplacement = Polar
                .random2D(randomizer)
                .radiusSet(shipGroupDistance)
                .toCoords();
            var player = Playable.entityFromPlace(placeHyperspace);
            var playerPos = Locatable.of(player).pos();
            var shipGroupPos = shipGroupDisplacement.add(playerPos);
            var shipGroupMurch = factionMurch.shipGroupGenerateAtPos(shipGroupPos);
            placeHyperspace.shipGroupAdd(shipGroupMurch, world);
        }
        return null;
    }
}
