"use strict";
class Planet {
    constructor(name, defnName, radiusOuter, offsetFromPrimaryAsPolar, factionName, characteristics) {
        this.name = name;
        this.defnName = defnName;
        this.radiusOuter = radiusOuter;
        this.offsetFromPrimaryAsPolar = offsetFromPrimaryAsPolar;
        this.factionName = factionName;
        this.characteristics = characteristics;
    }
    static from6(name, defnName, radiusOuter, offsetFromPrimaryAsPolar, sizeSurface, satellites) {
        return new Planet(name, defnName, radiusOuter, offsetFromPrimaryAsPolar, null, // factionName,
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
        var orbitColor;
        var colors = Color.Instances();
        if (this.characteristics == null) {
            orbitColor = colors.Gray;
        }
        else {
            var temperature = this.characteristics.temperature;
            orbitColor =
                (temperature > 200
                    ? colors.Red
                    : temperature > 100
                        ? colors.Brown
                        : temperature > 0
                            ? colors.GreenDark
                            : colors.BlueDark);
        }
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
    shipGroupInOrbit() {
        return (this.characteristics == null ? null : this.characteristics.shipGroupInOrbit);
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
    toEntityForPlanetVicinity(world, isPrimary, vicinityCenterPos, orbitColor, entityDimension) {
        var globeRadius = entityDimension;
        var orbitMultiplier = 4; // hack
        var collider = Sphere.fromRadius(globeRadius);
        var collidable = Collidable.fromCollider(collider);
        var planetDefn = this.defn();
        var globeVisual;
        var posWithinVicinity = vicinityCenterPos.clone();
        var orbitRadius;
        var orbitCenterPos;
        if (isPrimary) {
            globeVisual = planetDefn.visualVicinityPrimary;
            orbitRadius =
                this.offsetFromPrimaryAsPolar.radius * orbitMultiplier;
            var offsetToOrbitCenter = this.offsetFromPrimaryAsPolar
                .toCoords(Coords.create())
                .invert()
                .multiplyScalar(orbitMultiplier);
            orbitCenterPos =
                offsetToOrbitCenter.add(vicinityCenterPos);
        }
        else {
            globeVisual = planetDefn.visualVicinitySatellite;
            orbitRadius =
                this.offsetFromPrimaryAsPolar.radius * orbitMultiplier;
            orbitCenterPos = vicinityCenterPos;
            var offsetFromPrimary = Polar.fromAzimuthInTurnsAndRadius(this.offsetFromPrimaryAsPolar.azimuthInTurns + .5, orbitRadius).wrap().toCoords(Coords.create());
            posWithinVicinity.add(offsetFromPrimary);
        }
        var orbitVisualPath = VisualCircle.fromRadiusAndColorBorder(orbitRadius, orbitColor);
        var orbitVisual = VisualAnchor.fromChildAndPosToAnchorAt(orbitVisualPath, orbitCenterPos);
        var visual = new VisualGroup([
            orbitVisual,
            globeVisual
        ]);
        var drawable = Drawable.fromVisual(visual);
        var locatable = Locatable.fromPos(posWithinVicinity);
        var entityName = isPrimary ? Planet.name : this.name;
        var entity = new Entity(entityName, [
            collidable,
            drawable,
            locatable,
            this
        ]);
        var faction = this.faction(world);
        if (faction != null) {
            var talker = faction.toTalker();
            entity.propertyAdd(talker);
            var shipGroupInOrbit = this.shipGroupInOrbit();
            if (shipGroupInOrbit != null) {
                entity.propertyAdd(shipGroupInOrbit);
            }
        }
        return entity;
    }
    toEntityForStarsystem(world, primary, primaryPos) {
        var pos = primaryPos.clone().add(this.offsetFromPrimaryAsPolar.toCoords(Coords.create()));
        var orbitColor = (primary == null ? this.orbitColor() : primary.orbitColor());
        var planetDefn = this.defn();
        var visual = new VisualGroup([
            new VisualAnchor(new VisualCircle(this.offsetFromPrimaryAsPolar.radius, null, orbitColor, null), primaryPos, null // ?
            ),
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
        return this.offsetFromPrimaryAsPolar.toCoords(Coords.create());
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
