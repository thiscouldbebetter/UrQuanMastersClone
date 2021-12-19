"use strict";
class PlacePlanetOrbit extends Place {
    constructor(world, planet, placePlanetVicinity) {
        super(PlacePlanetOrbit.name, PlacePlanetOrbit.name, null, []);
        this.planet = planet;
        this.placePlanetVicinity = placePlanetVicinity;
        var entities = this.entitiesToSpawn;
        var resourceRadiusBase = 5; // todo
        var resourceEntities = this.planet.resources.map(x => x.toEntity(world, this, resourceRadiusBase));
        entities.push(...resourceEntities);
        // todo - Lifeforms and energy sources.
        this._camera = new Camera(Coords.fromXY(1, 1).multiplyScalar(this.planet.sizeSurface.y), null, // focalLength
        Disposition.fromOrientation(Orientation.Instances().ForwardZDownY.clone()), null // entitiesInViewSort
        );
        var cameraAsEntity = CameraHelper.toEntity(this._camera);
        entities.push(cameraAsEntity);
        this._drawPos = Coords.create();
    }
    // methods
    land(universe) {
        var world = universe.world;
        var placeOrbit = world.placeCurrent;
        var planet = placeOrbit.planet;
        var placeNext = new PlacePlanetSurface(world, planet, placeOrbit);
        world.placeNext = placeNext;
    }
    returnToPlaceParent(universe) {
        var world = universe.world;
        var placeOrbit = world.placeCurrent;
        var placePlanetVicinity = placeOrbit.placePlanetVicinity;
        world.placeNext = placePlanetVicinity;
    }
    scanEnergy(universe) {
        this.hasEnergyBeenScanned = true;
    }
    scanLife(universe) {
        this.hasLifeBeenScanned = true;
    }
    scanMinerals(universe) {
        this.haveMineralsBeenScanned = true;
    }
    // overrides
    draw(universe, world) {
        var uwpe = new UniverseWorldPlaceEntities(universe, world, this, null, null);
        var display = universe.display;
        super.draw(uwpe, display);
        this.venueControls.draw(universe);
        var controlContainer = this.venueControls.controlRoot;
        var controlMap = controlContainer.childByName("containerMap");
        var mapPos = controlMap.pos;
        var mapSize = controlMap.size;
        var surfaceSize = this.planet.sizeSurface;
        var scanContacts = this.entities;
        var contactPosSaved = Coords.create();
        for (var i = 0; i < scanContacts.length; i++) {
            var contact = scanContacts[i];
            var contactDrawable = contact.drawable();
            if (contactDrawable != null) {
                var contactLocatable = contact.locatable();
                var contactLoc = contactLocatable.loc;
                var contactPos = contactLoc.pos;
                contactPosSaved.overwriteWith(contactPos);
                var drawPos = this._drawPos.overwriteWith(contactPos).divide(surfaceSize).multiply(mapSize).add(mapPos);
                contactPos.overwriteWith(drawPos);
                var contactVisual = contactDrawable.visual;
                contactVisual.draw(uwpe.entitySet(contact), display);
                contactPos.overwriteWith(contactPosSaved);
            }
        }
    }
    updateForTimerTick(uwpe) {
        var universe = uwpe.universe;
        var world = uwpe.world;
        super.updateForTimerTick(uwpe);
        if (this.venueControls == null) {
            var controlRoot = this.toControl(universe, world);
            this.venueControls = VenueControls.fromControl(controlRoot);
        }
        this.venueControls.updateForTimerTick(universe);
    }
    // controls
    toControl(universe, worldAsWorld) {
        var world = worldAsWorld;
        var placePlanetOrbit = this;
        var planet = this.planet;
        var containerMainSize = universe.display.sizeInPixels.clone();
        var fontHeight = 20;
        var fontHeightShort = fontHeight / 2;
        var buttonBackSize = Coords.fromXY(1, 1).multiplyScalar(1.6 * fontHeightShort);
        var marginWidth = 8;
        var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
        var titleSize = Coords.fromXY(containerMainSize.x, 25);
        var labelSize = Coords.fromXY(200, 10);
        var containerRightSize = Coords.fromXY((containerMainSize.x - marginSize.x * 3) / 4, containerMainSize.y - marginSize.y * 3 - titleSize.y);
        var buttonSizeRight = Coords.fromXY(containerRightSize.x - marginSize.x * 2, fontHeightShort * 1.5);
        var buttonScanSize = Coords.fromXY(containerRightSize.x - marginSize.x * 4, buttonSizeRight.y);
        var containerScanSize = Coords.fromXY(containerRightSize.x - marginSize.x * 2, buttonScanSize.y * 3 + marginSize.y * 2);
        var containerMapSize = Coords.fromXY(containerMainSize.x - marginSize.x * 3 - containerRightSize.x, (containerRightSize.y - marginSize.y) / 2);
        var containerInfoSize = Coords.fromXY((containerMapSize.x - marginSize.x) / 2, containerMapSize.y);
        var containerInfo = ControlContainer.from4("containerInfo", Coords.fromXY(marginSize.x, marginSize.y * 2 + titleSize.y), containerInfoSize, 
        // children
        [
            new ControlLabel("labelName", Coords.fromXY(marginSize.x, labelSize.y), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Name: " + planet.name), fontHeightShort),
            new ControlLabel("labelMass", Coords.fromXY(marginSize.x, labelSize.y * 2), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Mass: "
                + planet.mass.toExponential(3).replace("e", " x 10^").replace("+", "")
                + " kg"), fontHeightShort),
            new ControlLabel("labelRadius", Coords.fromXY(marginSize.x, labelSize.y * 3), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Radius: " + planet.radius + " km"), fontHeightShort),
            new ControlLabel("labelGravity", Coords.fromXY(marginSize.x, labelSize.y * 4), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Surface Gravity: " + planet.gravity + "g"), fontHeightShort),
            new ControlLabel("labelOrbitDistance", Coords.fromXY(marginSize.x, labelSize.y * 5), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Orbit: "
                + planet.orbit.toExponential(3).replace("e", " x 10^").replace("+", "")
                + " km"), fontHeightShort),
            new ControlLabel("labelRotationPeriod", Coords.fromXY(marginSize.x, labelSize.y * 6), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Day: " + planet.day + " hours"), fontHeightShort),
            new ControlLabel("labelOrbitPeriod", Coords.fromXY(marginSize.x, labelSize.y * 7), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Year: " + planet.year + " Earth days"), fontHeightShort),
            new ControlLabel("labelTemperature", Coords.fromXY(marginSize.x, labelSize.y * 8), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Temperature: " + planet.temperature + " C"), fontHeightShort),
            new ControlLabel("labelWeather", Coords.fromXY(marginSize.x, labelSize.y * 9), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Weather: Class " + planet.weather), fontHeightShort),
            new ControlLabel("labelTectonics", Coords.fromXY(marginSize.x, labelSize.y * 10), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Tectonics: Class " + planet.tectonics), fontHeightShort),
        ]);
        var visualGlobe = new VisualGroup([
            VisualRectangle.fromSizeAndColorFill(containerInfoSize, Color.byName("Black")),
            VisualCircle.fromRadiusAndColorFill(containerInfoSize.y * .4, Color.byName("Gray")),
            new VisualCircleGradient(containerInfoSize.y * .4, new ValueBreakGroup([
                new ValueBreak(0, planet.defn().color),
                new ValueBreak(1, Color.byName("Black"))
            ], null // interpolationMode
            ), planet.defn().color)
        ]);
        var containerGlobe = ControlContainer.from4("containerGlobe", Coords.fromXY(marginSize.x * 2 + containerInfoSize.x, marginSize.y * 2 + titleSize.y), containerInfoSize, 
        // children
        [
            ControlVisual.from4("visualGlobe", Coords.fromXY(0, 0), containerInfoSize, DataBinding.fromContext(visualGlobe))
        ]);
        var containerPlayer = world.player.toControlSidebar(world);
        var containerRight = ControlContainer.from4("containerRight", Coords.fromXY(marginSize.x * 2 + containerMapSize.x, marginSize.y * 2 + titleSize.y), containerRightSize, 
        // children
        [
            containerPlayer,
            new ControlLabel("labelScan", Coords.fromXY(marginSize.x, containerRightSize.y
                - marginSize.y * 3
                - buttonSizeRight.y
                - containerScanSize.y
                - labelSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Scan:"), fontHeightShort),
            ControlContainer.from4("containerScan", Coords.fromXY(marginSize.x, containerRightSize.y
                - marginSize.y * 2
                - buttonSizeRight.y
                - containerScanSize.y), containerScanSize, [
                ControlButton.from8("buttonScanMineral", Coords.fromXY(marginSize.x, marginSize.y), buttonScanSize, "Mineral", fontHeightShort, true, // hasBorder,
                DataBinding.fromTrue(), // isEnabled,
                () => {
                    placePlanetOrbit.scanMinerals(universe);
                }),
                ControlButton.from8("buttonScanLife", Coords.fromXY(marginSize.x, marginSize.y + buttonScanSize.y), buttonScanSize, "Life", fontHeightShort, true, // hasBorder,
                DataBinding.fromTrue(), // isEnabled,
                () => {
                    placePlanetOrbit.scanLife(universe);
                }),
                ControlButton.from8("buttonScanEnergy", Coords.fromXY(marginSize.x, marginSize.y + buttonScanSize.y * 2), buttonScanSize, "Energy", fontHeightShort, true, // hasBorder,
                DataBinding.fromTrue(), // isEnabled,
                () => {
                    placePlanetOrbit.scanEnergy(universe);
                }),
            ]),
            ControlButton.from8("buttonLand", Coords.fromXY(marginSize.x, containerRightSize.y - marginSize.y - buttonSizeRight.y), buttonSizeRight, "Land", fontHeightShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            () => {
                placePlanetOrbit.land(universe);
            }),
        ]);
        var controlRoot = ControlContainer.from4("containerPlanetOrbit", Coords.fromXY(0, 0), // pos
        containerMainSize, [
            new ControlLabel("labelOrbit", Coords.fromXY(containerMainSize.x / 2, marginSize.y + titleSize.y / 2), titleSize, true, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Orbit"), fontHeight),
            containerInfo,
            containerGlobe,
            ControlContainer.from4("containerMap", Coords.fromXY(marginSize.x, marginSize.y * 3 + titleSize.y + containerMapSize.y), containerMapSize, 
            // children
            [
                ControlVisual.from4("visualSurface", Coords.Instances().Zeroes, containerMapSize, DataBinding.fromContext(new VisualImageScaled(new VisualImageFromLibrary("PlanetSurface"), containerMapSize))),
            ]),
            containerRight,
            ControlButton.from8("buttonBack", marginSize, buttonBackSize, "<", fontHeightShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            this.returnToPlaceParent.bind(this)),
        ]);
        return controlRoot;
    }
}
