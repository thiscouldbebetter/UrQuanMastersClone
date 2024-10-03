"use strict";
class EnergySource {
    constructor(name, pos, visual, itemDefn, collideWithLander) {
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
        var collider = new Sphere(Coords.create(), dimension);
        var collidable = Collidable.fromCollider(collider);
        var visualDetailed = new VisualWrapped(planet.sizeSurface(), this.visual);
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
        var returnValue = new Entity(this.name, [
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
        var visualNone = new VisualNone(); // todo
        var itemDefnNone = null;
        var collideWithLanderTodo = (uwpe) => { throw new Error("todo"); };
        var vifl = VisualImageFromLibrary;
        this.AbandonedMoonbase = new es("AbandonedMoonbase", posNone, new vifl(EnergySource.name + "AbandonedMoonbase"), itemDefnNone, this.abandonedMoonbase_CollideWithLander);
        this.CrashedShackler = new es("CrashedShackler", posNone, visualNone, itemDefnNone, collideWithLanderTodo);
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
    mauluskaOrphan_CollideWithLander(uwpe) {
        var textMauluskaOrphan = "MauluskaOrphan";
        var universe = uwpe.universe;
        var mediaLibrary = universe.mediaLibrary;
        var message = mediaLibrary.textStringGetByName(EnergySource.name + textMauluskaOrphan).value;
        var conversationDefnSerialized = mediaLibrary.textStringGetByName("Conversation-" + textMauluskaOrphan).value;
        var controlMessage = universe.controlBuilder.message(universe, universe.display.sizeInPixels, DataBinding.fromContext(message), () => // acknowledge
         {
            var conversationDefn = ConversationDefn.deserialize(conversationDefnSerialized);
            var conversationRun = ConversationRun.fromConversationDefn(conversationDefn);
            var conversationVenue = conversationRun.toVenue(universe);
            universe.venueTransitionTo(conversationVenue);
        }, null, // showMessageOnly
        FontNameAndHeight.fromHeightInPixels(5));
        universe.venueTransitionTo(VenueControls.fromControl(controlMessage));
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
            var shipGroupDisplacement = Polar.random2D().radiusSet(shipGroupDistance).toCoords(Coords.create());
            var player = placeHyperspace.player();
            var playerPos = player.locatable().pos();
            var shipGroupPos = shipGroupDisplacement.add(playerPos);
            var shipGroupMurch = factionMurch.shipGroupGenerateAtPos(shipGroupPos);
            placeHyperspace.shipGroupAdd(shipGroupMurch, world);
        }
        return null;
    }
}
