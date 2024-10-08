"use strict";
class Faction {
    constructor(name, nameOriginal, color, talksImmediately, conversationDefnName, territory, shipDefnName, diplomaticRelationshipTypeWithPlayerDefault, shipGroupActivity) {
        this.name = name;
        this.nameOriginal = nameOriginal;
        this.color = color;
        this.talksImmediately = talksImmediately;
        this.conversationDefnName = conversationDefnName;
        this.territory = territory;
        this.shipDefnName = shipDefnName;
        this.diplomaticRelationshipTypeWithPlayerDefault =
            diplomaticRelationshipTypeWithPlayerDefault;
        this.shipGroupActivity = shipGroupActivity;
    }
    static fromEntity(entity) {
        return entity.propertyByName(Faction.name);
    }
    conversationDefnNameSet(value) {
        this.conversationDefnName = value;
        return this;
    }
    diplomaticRelationshipDefaultBuild() {
        return new DiplomaticRelationship(this.name, DiplomaticRelationshipType.Instances().Neutral.name);
    }
    shipDefn(world) {
        var returnValue = world.shipDefnByName(this.shipDefnName);
        return returnValue;
    }
    shipGroupGenerateAtPos(pos) {
        var shipCount = 1; // todo
        var ships = new Array();
        for (var i = 0; i < shipCount; i++) {
            var ship = Ship.fromDefnName(this.shipDefnName);
            ships.push(ship);
        }
        var shipGroup = ShipGroupFinite.fromFactionNameAndShips(this.name, ships).posSet(pos);
        return shipGroup;
    }
    starsystems(world) {
        // Tersely-named alias method.
        return this.starsystemsInTerritory(world);
    }
    starsystemsInTerritory(world) {
        var hyperspace = world.hyperspace;
        var territory = this.territory;
        var territoryShape = territory.shape;
        var starsystemsInTerritory = hyperspace.starsystems.filter(x => territoryShape.containsPoint(x.posInHyperspace));
        return starsystemsInTerritory;
    }
    talkerToControl(cr, size, universe) {
        return cr.toControl_Layout_2(size, universe);
    }
    toEncounter(uwpe) {
        var shipGroup = this.shipGroupGenerateAtPos(Coords.zeroes());
        var encounter = shipGroup.toEncounter(uwpe);
        return encounter;
    }
    toTalker() {
        var talker = new Talker(this.conversationDefnName, null, this.talkerToControl);
        return talker;
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Faction.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
