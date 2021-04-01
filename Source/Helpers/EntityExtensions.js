"use strict";
class EntityExtensions {
    static energySource(entity) {
        return entity.propertyByName(EnergySource.name);
    }
    static faction(entity) {
        return entity.propertyByName(Faction.name);
    }
    static lifeform(entity) {
        return entity.propertyByName(Lifeform.name);
    }
    static planet(entity) {
        return entity.propertyByName(Planet.name);
    }
    static ship(entity) {
        return entity.propertyByName(Ship.name);
    }
    static shipGroup(entity) {
        return entity.propertyByName(ShipGroup.name);
    }
    static starsystem(entity) {
        return entity.propertyByName(Starsystem.name);
    }
    static station(entity) {
        return entity.propertyByName(Station.name);
    }
}
