"use strict";
class PlaceEncounter extends PlaceBase {
    constructor(encounter) {
        super(PlaceEncounter.name + encounter.factionName, // name
        PlaceEncounter.name, // defnName
        null, // parentName
        null, // size
        [encounter.entityPlayer, encounter.entityOther] // entities
        );
        this.encounter = encounter;
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
                this.encounter.talk(universe);
                return; // hack
            }
            var entityOther = encounter.entityOther;
            var shipGroupOther = ShipGroupBase.fromEntity(entityOther);
            if (shipGroupOther == null) {
                this.encounter.talk(universe);
                return; // hack
            }
            else {
                var shipGroupOtherDescription = shipGroupOther.toStringDescription(world);
                var newline = "\n";
                var messageToShow = "Encounter" + newline
                    + "with " + shipGroupOtherDescription + newline
                    + "near " + encounter.planet.name;
                var choiceNames = ["Talk"];
                var choiceActions = [() => this.encounter.talk(universe)];
                var player = world.player;
                if (player.diplomaticRelationshipWithFactionIsHostile(faction)) {
                    choiceNames.push("Fight");
                    choiceActions.push(() => this.encounter.fight(universe));
                }
                var controlRoot = universe.controlBuilder.choice5(universe, universe.display.sizeInPixels.clone(), DataBinding.fromContext(messageToShow), choiceNames, choiceActions);
                this.venueControls = VenueControls.fromControl(controlRoot);
            }
        }
        this.venueControls.updateForTimerTick(universe);
    }
}
