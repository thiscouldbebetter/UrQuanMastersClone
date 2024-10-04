"use strict";
class Planet {
    constructor(name, defnName, radiusOuter, posAsPolar, factionName, characteristics) {
        this.name = name;
        this.defnName = defnName;
        this.radiusOuter = radiusOuter;
        this.posAsPolar = posAsPolar;
        this.factionName = factionName;
        this.characteristics = characteristics;
    }
    static from6(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites) {
        return new Planet(name, defnName, radiusOuter, posAsPolar, null, // factionName,
        PlanetCharacteristics.fromSizeSurfaceAndSatellites(sizeSurface, satellites));
    }
    static activityDefnGravitate() {
        return new ActivityDefn("Gravitate", Planet.activityGravitatePerform);
    }
    static activityGravitatePerform(uwpe) {
        var place = uwpe.place;
        var actor = uwpe.entity;
        var planet = actor;
        var planetPos = planet.locatable().loc.pos;
        var entitiesShips = place.entitiesByPropertyName(Ship.name);
        for (var i = 0; i < entitiesShips.length; i++) {
            var ship = entitiesShips[i];
            var shipLoc = ship.locatable().loc;
            var shipPos = shipLoc.pos;
            var displacement = shipPos.clone().subtractWrappedToRangeMax(planetPos, place.size());
            var distance = displacement.magnitude();
            if (distance > 0) {
                var direction = displacement.divideScalar(distance);
                var graviticConstant = -100;
                var accelerationMagnitude = graviticConstant / (distance * distance);
                var accelToAdd = direction.multiplyScalar(accelerationMagnitude);
                shipLoc.accel.add(accelToAdd);
            }
        }
    }
    static fromEntity(entity) {
        return entity.propertyByName(Planet.name);
    }
    // instance methods
    defn() {
        return PlanetDefn.byName(this.defnName);
    }
    energySources() {
        return this.characteristics.energySources;
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    isStation() {
        return this._isStation;
    }
    isStationSet(value) {
        this._isStation = value;
        return this;
    }
    lifeforms(randomizer) {
        return this.characteristics.lifeforms(this, randomizer);
    }
    lifeformsGenerate(randomizer) {
        return this.lifeforms(randomizer);
    }
    mineralsGenerate(randomizer) {
        this.resources(randomizer);
    }
    resources(randomizer) {
        return this.characteristics.resources(this, randomizer);
    }
    orbitColor() {
        var temperature = this.characteristics.temperature;
        var colors = Color.Instances();
        var orbitColor = (temperature > 100
            ? colors.Brown
            : temperature > 0
                ? colors.GreenDark
                : colors.BlueDark);
        return orbitColor;
    }
    satelliteAdd(satellite) {
        this.characteristics.satelliteAdd(satellite);
        return this;
    }
    satelliteGetAtIndex(index) {
        return this.characteristics.satelliteGetAtIndex(index);
    }
    satelliteInsertAtIndex(satellite, index) {
        this.characteristics.satelliteInsertAtIndex(satellite, index);
        return this;
    }
    satellitesGet() {
        return this.characteristics.satellitesGet();
    }
    shipGroupInVicinityAdd(shipGroup) {
        this.characteristics.shipGroupInVicinityAdd(shipGroup);
        return this;
    }
    shipGroupRemove(shipGroup) {
        this.characteristics.shipGroupInVicinityRemove(shipGroup);
        return this;
    }
    shipGroupsInVicinity() {
        return this.characteristics.shipGroupsInVicinity();
    }
    sizeSurface() {
        return (this.isStation() ? Coords.zeroes() : this.characteristics.sizeSurface);
    }
    toEntity(world, primary, primaryPos) {
        var pos = primaryPos.clone().add(this.posAsPolar.toCoords(Coords.create()));
        var orbitColor = (primary == null ? this.orbitColor() : primary.orbitColor());
        var planetDefn = this.defn();
        var visual = new VisualGroup([
            new VisualAnchor(new VisualCircle(this.posAsPolar.radius, null, orbitColor, null), primaryPos, null // ?
            ),
            //VisualCircle.fromRadiusAndColorFill(this.radiusOuter, planetDefn.color)
            planetDefn.visualStarsystem
        ]);
        var collider = new Sphere(Coords.create(), this.radiusOuter);
        var returnValue = new Entity(this.name, [
            Collidable.fromCollider(collider),
            Drawable.fromVisual(visual),
            this, // planet
            Locatable.fromPos(pos),
        ]);
        var faction = this.faction(world);
        if (faction != null) {
            var talker = faction.toTalker();
            returnValue.propertyAdd(talker);
        }
        return returnValue;
    }
    toPlace(world) {
        if (this._place == null) {
            this._place = new PlacePlanetVicinity(world, this, null, // playerLoc
            null // placeStarsystem
            );
        }
        return this._place;
    }
    pos() {
        return this.posAsPolar.toCoords(Coords.create());
    }
    // Clonable.
    clone() { throw new Error("todo"); }
    overwriteWith(other) { throw new Error("todo"); }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) {
        var universe = uwpe.universe;
        var randomizer = universe.randomizer;
        this.mineralsGenerate(randomizer);
        this.lifeformsGenerate(randomizer);
    }
    propertyName() { return Planet.name; }
    updateForTimerTick(uwpe) {
        // Do nothing.
    }
    // Equatable.
    equals(other) { return false; }
}
