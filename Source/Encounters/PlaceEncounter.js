"use strict";
class PlaceEncounter extends Place {
    constructor(world, encounter) {
        super(PlaceEncounter.name, PlaceEncounter.name, null, // parentName
        null, // size
        null // entities
        );
        this.encounter = encounter;
    }
    // methods
    fight(universe) {
        var world = universe.world;
        var placeEncounter = world.placeCurrent;
        var encounter = placeEncounter.encounter;
        var displaySize = universe.display.sizeInPixels;
        var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 2);
        var player = world.player;
        var shipGroupOther = EntityExtensions.shipGroup(encounter.entityOther);
        var shipGroups = [player.shipGroup, shipGroupOther];
        var combat = new Combat(combatSize, encounter, shipGroups);
        combat.initialize(universe, world, placeEncounter);
        var shipSelect = combat.toControlShipSelect(universe, universe.display.sizeInPixels);
        universe.venueNext = VenueControls.fromControl(shipSelect);
    }
    talk(universe) {
        var world = universe.world;
        var placeEncounter = world.placeCurrent;
        var encounter = placeEncounter.encounter;
        var faction = this.encounter.faction(world);
        var conversationDefnName = faction.conversationDefnName;
        var conversationResourceName = "Conversation-" + conversationDefnName;
        var venueToReturnTo = universe.venueCurrent;
        var conversationQuit = () => {
            encounter.returnToPlace(world);
            universe.venueNext = venueToReturnTo;
        };
        var entityTalker = encounter.entityOther;
        var talker = entityTalker.talker();
        talker.conversationDefnName = conversationResourceName;
        talker.quit = conversationQuit;
        var uwpe = new UniverseWorldPlaceEntities(universe, world, this, entityTalker, null);
        talker.talk(uwpe);
    }
    // Place
    draw(universe, world) {
        //super.draw(universe, world);
        if (this.venueControls != null) {
            this.venueControls.draw(universe);
        }
    }
    updateForTimerTick(uwpe) {
        var universe = uwpe.universe;
        super.updateForTimerTick(uwpe);
        if (this.venueControls == null) {
            var encounter = this.encounter;
            var factionName = encounter.factionName;
            var world = uwpe.world;
            var worldDefn = world.defnExtended();
            var faction = worldDefn.factionByName(factionName);
            if (faction.talksImmediately) {
                this.talk(universe);
                return; // hack
            }
            var shipGroupOther = EntityExtensions.shipGroup(encounter.entityOther);
            var shipGroupOtherDescription = shipGroupOther.toStringDescription();
            var newline = "\n";
            var messageToShow = "Encounter" + newline
                + "with " + shipGroupOtherDescription + newline
                + "near " + encounter.planet.name;
            var choiceNames = ["Talk"];
            var choiceActions = [() => this.talk(universe)];
            if (faction.relationsWithPlayer == Faction.RelationsHostile) {
                choiceNames.push("Fight");
                choiceActions.push(() => this.fight(universe));
            }
            var controlRoot = universe.controlBuilder.choice(universe, universe.display.sizeInPixels.clone(), DataBinding.fromContext(messageToShow), choiceNames, choiceActions, null // ?
            );
            this.venueControls = VenueControls.fromControl(controlRoot);
        }
        this.venueControls.updateForTimerTick(universe);
    }
}
