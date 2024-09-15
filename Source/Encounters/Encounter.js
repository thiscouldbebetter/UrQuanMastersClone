"use strict";
class Encounter {
    constructor(planet, factionName, entityPlayer, entityOther, placeToReturnTo, posToReturnTo) {
        this.planet = planet;
        this.factionName = factionName;
        this.entityPlayer = entityPlayer;
        this.entityOther = entityOther;
        this.placeToReturnTo = placeToReturnTo;
        this.posToReturnTo = posToReturnTo;
        this.endsInCombatSet(false);
    }
    endsInCombatSet(value) {
        this.endsInCombat = value;
        return this;
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    fight(universe) {
        this.endsInCombatSet(true);
        var world = universe.world;
        var encounter = this;
        var displaySize = universe.display.sizeInPixels;
        var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 4);
        var player = world.player;
        var shipGroupOther = ShipGroup.fromEntity(encounter.entityOther);
        var shipGroups = [player.shipGroup, shipGroupOther];
        var combat = new Combat(combatSize, encounter, shipGroups);
        world.placeNextSet(combat.toPlace(world));
        // These lines are necessary.
        var venueNext = new VenueWorld(world);
        universe.venueNextSet(venueNext);
    }
    goToPlaceNext(universe) {
        if (this.endsInCombat) {
            this.fight(universe);
        }
        else {
            var world = universe.world;
            var placeNext = world.placeNext || this.placeToReturnTo;
            var playerFromPlaceNext = placeNext.entityByName(Player.name);
            if (playerFromPlaceNext != null) {
                var playerLoc = playerFromPlaceNext.locatable().loc;
                playerLoc.pos.overwriteWith(this.posToReturnTo);
                playerLoc.vel.clear();
            }
            world.placeNextSet(placeNext);
            universe.venueNextSet(world.toVenue());
        }
    }
    placeToReturnToSet(value) {
        this.placeToReturnTo = value;
        return this;
    }
    posInHyperspace() {
        var returnPos = null;
        var place = this.placeToReturnTo;
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlaceHyperspace.name) {
            returnPos = place.player().locatable().loc.pos;
        }
        else if (placeTypeName == PlaceStarsystem.name) {
            //var starsystem = (place as PlaceStarsystem).starsystem();
            throw new Error("Unexpected placeTypeName: " + placeTypeName);
        }
        else if (placeTypeName == PlacePlanetVicinity.name) {
            //var starsystem = (place as PlacePlanetVicinity).starsystem();
            throw new Error("Unexpected placeTypeName: " + placeTypeName);
        }
        else {
            throw new Error("Unexpected placeTypeName: " + placeTypeName);
        }
        return returnPos;
    }
    talk(universe) {
        var world = universe.world;
        var place = world.placeCurrent;
        var encounter = this;
        var faction = encounter.faction(world);
        var conversationDefnName = faction.conversationDefnName;
        var conversationResourceName = conversationDefnName;
        var conversationQuit = () => {
            encounter.goToPlaceNext(universe);
        };
        var entityPlayer = encounter.entityPlayer;
        var entityTalker = encounter.entityOther;
        var talker = entityTalker.talker();
        talker.conversationDefnName = conversationResourceName;
        talker.quit = conversationQuit;
        var uwpe = new UniverseWorldPlaceEntities(universe, world, place, entityTalker, entityPlayer);
        talker.talk(uwpe);
    }
    toPlace() {
        return new PlaceEncounter(this);
    }
}
