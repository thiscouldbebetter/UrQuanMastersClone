"use strict";
class Planet {
    constructor(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites, shipGroups, mass, radius, gravity, orbit, day, year, tectonics, weather, temperature, hasLife, energySources) {
        this.name = name;
        this.defnName = defnName;
        this.radiusOuter = radiusOuter;
        this.posAsPolar = posAsPolar;
        this.sizeSurface = sizeSurface;
        this.satellites = satellites;
        this.shipGroups = (shipGroups == null ? [] : shipGroups);
        this.mass = Math.round(mass);
        this.radius = Math.round(radius);
        this.gravity = parseFloat(gravity.toFixed(2));
        this.orbit = Math.round(orbit);
        this.day = day;
        this.year = year;
        this.tectonics = tectonics;
        this.weather = weather;
        this.temperature = temperature;
        this.hasLife = hasLife;
        this.energySources = energySources;
    }
    static from6(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites) {
        return new Planet(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites, null, null, null, null, null, null, null, null, null, null, null, null);
    }
    // instance methods
    defn() {
        return PlanetDefn.byName(this.defnName);
    }
    lifeformsGenerate(randomizer) {
        this.lifeforms = new Array();
        if (this.hasLife) {
            var numberOfLifeforms = 8; // todo
            for (var i = 0; i < numberOfLifeforms; i++) {
                var lifeformPos = Coords.create().randomize(randomizer).multiply(this.sizeSurface);
                var lifeform = new Lifeform("BiteyMouse", lifeformPos);
                this.lifeforms.push(lifeform);
            }
        }
        return this.lifeforms;
    }
    mineralsGenerate(randomizer) {
        var planet = this;
        var resources = planet.resources;
        if (resources == null) {
            var resources = new Array();
            var planetDefn = planet.defn();
            var planetSize = planet.sizeSurface;
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
            planet.resources = resources;
        }
    }
    toEntity(primaryPos) {
        var pos = primaryPos.clone().add(this.posAsPolar.toCoords(Coords.create()));
        var planetDefn = this.defn();
        var visual = new VisualGroup([
            new VisualAnchor(new VisualCircle(this.posAsPolar.radius, null, Color.byName("Gray"), null), primaryPos, null // ?
            ),
            VisualCircle.fromRadiusAndColorFill(this.radiusOuter, planetDefn.color)
        ]);
        var collider = new Sphere(Coords.create(), this.radiusOuter);
        var returnValue = new Entity(this.name, [
            CollidableHelper.fromCollider(collider),
            Drawable.fromVisual(visual),
            this,
            Locatable.fromPos(pos),
        ]);
        return returnValue;
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) {
        var universe = uwpe.universe;
        var randomizer = universe.randomizer;
        this.mineralsGenerate(randomizer);
        this.lifeformsGenerate(randomizer);
    }
    updateForTimerTick(uwpe) {
        // Do nothing.
    }
    // Equatable.
    equals(other) { return false; }
}
