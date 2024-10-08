"use strict";
class DiplomaticRelationship {
    constructor(factionOtherName, relationshipTypeName) {
        this.factionOtherName = factionOtherName;
        this.relationshipTypeName = relationshipTypeName;
    }
    factionOther(world) {
        return world.factionByName(this.factionOtherName);
    }
    allianceEstablish() {
        this.relationshipTypeName =
            DiplomaticRelationshipType.Instances().Allied.name;
        return this;
    }
    isAllied() {
        return (this.relationshipTypeName == DiplomaticRelationshipType.Instances().Allied.name);
    }
    isHostile() {
        return (this.relationshipTypeName == DiplomaticRelationshipType.Instances().Hostile.name);
    }
}
class DiplomaticRelationshipType {
    constructor(name) {
        this.name = name;
    }
    static Instances() {
        if (this._instances == null) {
            this._instances = new DiplomaticRelationshipType_Instances();
        }
        return this._instances;
    }
    static byName(name) {
        return this.Instances().byName(name);
    }
}
class DiplomaticRelationshipType_Instances {
    constructor() {
        var dr = (name) => new DiplomaticRelationshipType(name);
        this.Allied = dr("Allied");
        this.Hostile = dr("Hostile");
        this.Neutral = dr("Neutral");
        this._All =
            [
                this.Allied,
                this.Hostile,
                this.Neutral
            ];
    }
    byName(name) {
        return this._All.find(x => x.name == name);
    }
}
