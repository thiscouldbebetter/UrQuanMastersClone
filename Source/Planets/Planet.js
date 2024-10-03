"use strict";
class Planet {
    constructor(name, defnName, radiusOuter, posAsPolar, characteristics) {
        this.name = name;
        this.defnName = defnName;
        this.radiusOuter = radiusOuter;
        this.posAsPolar = posAsPolar;
        this.characteristics = characteristics;
    }
    static from6(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites) {
        return new Planet(name, defnName, radiusOuter, posAsPolar, PlanetCharacteristics.fromSizeSurfaceAndSatellites(sizeSurface, satellites));
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
    shipGroupAdd(shipGroup) {
        this.characteristics.shipGroupAdd(shipGroup);
        return this;
    }
    shipGroupRemove(shipGroup) {
        this.characteristics.shipGroupRemove(shipGroup);
        return this;
    }
    shipGroups() {
        return this.characteristics.shipGroups();
    }
    sizeSurface() {
        return this.characteristics.sizeSurface;
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
class PlanetCharacteristics {
    constructor(sizeSurface, satellites, shipGroups, mass, radius, gravity, orbit, dayInHours, yearInEarthDays, tectonics, weather, temperature, biosphere, energySources, encounterOrbitName) {
        this.sizeSurface = sizeSurface;
        this.satellites = satellites || [];
        this._shipGroups = shipGroups || [];
        this.mass = Math.round(mass);
        this.radius = Math.round(radius);
        this.gravity = parseFloat(gravity.toFixed(2));
        this.orbit = Math.round(orbit);
        this.dayInHours = dayInHours;
        this.yearInEarthDays = Math.round(yearInEarthDays * 100) / 100;
        this.tectonics = tectonics;
        this.weather = weather;
        this.temperature = temperature;
        this.biosphere = biosphere;
        this.energySources = energySources || [];
        this.encounterOrbitName = encounterOrbitName;
    }
    static fromSizeSurfaceAndSatellites(sizeSurface, satellites // todo
    ) {
        return new PlanetCharacteristics(sizeSurface, satellites, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }
    lifeforms(planet, randomizer) {
        if (this._lifeforms == null) {
            this._lifeforms = this.biosphere.lifeformsGenerateForPlanet(planet, randomizer);
        }
        return this._lifeforms;
    }
    resources(planet, randomizer) {
        if (this._resources == null) {
            var resources = new Array();
            var planetDefn = planet.defn();
            var planetSize = this.sizeSurface;
            var resourceDistributions = planetDefn.resourceDistributions;
            for (var i = 0; i < resourceDistributions.length; i++) {
                var resourceDistribution = resourceDistributions[i];
                var resourceDefnName = resourceDistribution.resourceDefnName;
                var numberOfDeposits = resourceDistribution.numberOfDeposits;
                var quantityPerDeposit = resourceDistribution.quantityPerDeposit;
                for (var d = 0; d < numberOfDeposits; d++) {
                    var resourcePos = Coords.create().randomize(randomizer).multiply(planetSize);
                    var resource = new Resource(resourceDefnName, quantityPerDeposit, resourcePos);
                    resources.push(resource);
                }
            }
            this._resources = resources;
        }
        return this._resources;
    }
    satelliteAdd(satellite) {
        this.satellites.push(satellite);
    }
    satelliteGetAtIndex(index) {
        return this.satellites[index];
    }
    satelliteInsertAtIndex(satellite, index) {
        this.satellites.splice(index, 0, satellite);
        return this;
    }
    satellitesGet() {
        return this.satellites;
    }
    shipGroupAdd(shipGroup) {
        this._shipGroups.push(shipGroup);
    }
    shipGroupRemove(shipGroup) {
        this._shipGroups.splice(this._shipGroups.indexOf(shipGroup), 1);
    }
    shipGroups() {
        return this._shipGroups;
    }
}
