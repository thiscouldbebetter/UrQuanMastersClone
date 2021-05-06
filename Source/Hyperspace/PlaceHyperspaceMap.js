"use strict";
class PlaceHyperspaceMap extends Place {
    constructor(placeHyperspaceToReturnTo) {
        super(PlaceHyperspaceMap.name, PlaceHyperspaceMap.name, null, []);
        this.placeHyperspaceToReturnTo = placeHyperspaceToReturnTo;
        this._displacement = Coords.create();
        this._drawPos = Coords.create();
        this._reticlePosInverted = Coords.create();
    }
    // methods
    fuelFromPlayerShipGroupToReticle(world) {
        var returnValue = this._displacement.overwriteWith(this.reticlePos).subtract(world.player.shipGroup.pos).magnitude();
        returnValue = Math.round(returnValue);
        return returnValue;
    }
    reticlePosAsStringXY() {
        var hyperspaceSize = this.placeHyperspaceToReturnTo.hyperspace.size;
        var returnValue = this._reticlePosInverted.overwriteWithDimensions(this.reticlePos.x, hyperspaceSize.y - this.reticlePos.y, 0).round().toStringXY();
        return returnValue;
    }
    // Place
    draw(universe, worldAsWorld, display) {
        super.draw(universe, world, display);
        var world = worldAsWorld;
        var display = this.displayMap;
        if (display == null) {
            return; // todo
        }
        var hyperspace = this.placeHyperspaceToReturnTo.hyperspace;
        var mapSize = this.displayMap.sizeInPixels;
        var zeroes = Coords.Instances().Zeroes;
        display.drawRectangle(zeroes, mapSize, Color.byName("Black"), Color.byName("Gray"), null);
        var camera = this._camera;
        var magnificationFactor = camera.focalLength / camera.viewSize.x;
        var drawPos = this._drawPos;
        var starRadius = .5;
        var starsystems = hyperspace.starsystems;
        for (var i = 0; i < starsystems.length; i++) {
            var starsystem = starsystems[i];
            var starColor = starsystem.starColor;
            var starsystemPos = starsystem.posInHyperspace;
            drawPos.overwriteWith(starsystemPos);
            this._camera.coordsTransformWorldToView(drawPos);
            var starRadiusApparent = starRadius * magnificationFactor;
            if (starRadiusApparent < 1) {
                starRadiusApparent = 1;
            }
            display.drawCircle(drawPos, starRadiusApparent, starColor, null, null);
        }
        var factionsKnownNames = world.player.factionsKnownNames;
        var worldDefn = world.defnExtended();
        for (var i = 0; i < factionsKnownNames.length; i++) {
            var factionName = factionsKnownNames[i];
            var faction = worldDefn.factionByName(factionName);
            var factionZone = faction.sphereOfInfluence;
            if (factionZone != null) {
                drawPos.overwriteWith(factionZone.center);
                this._camera.coordsTransformWorldToView(drawPos);
                var factionZoneRadiusScaled = factionZone.radius * magnificationFactor;
                var factionColor = faction.color;
                display.drawCircle(drawPos, factionZoneRadiusScaled, null, factionColor, null);
                display.drawText(faction.name, 10, //fontHeightInPixels,
                drawPos, factionColor, Color.byName("Gray"), false, // areColorsReversed,
                true, // isCentered,
                null);
            }
        }
        var entityForPlayer = this.placeHyperspaceToReturnTo.entitiesByPropertyName("playable")[0];
        var playerPos = entityForPlayer.locatable().loc.pos;
        drawPos.overwriteWith(playerPos);
        this._camera.coordsTransformWorldToView(drawPos);
        var locatorDimension = starRadius * 8 * magnificationFactor;
        var locatorSize = Coords.fromXY(1, 1).multiplyScalar(locatorDimension);
        display.drawRectangleCentered(drawPos, locatorSize, null, Color.byName("Gray"));
        var reticleRadius = locatorDimension * 2;
        drawPos.overwriteWith(this.reticlePos);
        this._camera.coordsTransformWorldToView(drawPos);
        display.drawCrosshairs(drawPos, reticleRadius, Color.byName("Gray"));
    }
    updateForTimerTick(universe, worldAsWorld) {
        var world = worldAsWorld;
        super.updateForTimerTick(universe, world);
        if (this.reticlePos == null) {
            var entityForPlayer = this.placeHyperspaceToReturnTo.entitiesByPropertyName("playable")[0];
            var playerPos = entityForPlayer.locatable().loc.pos;
            this.reticlePos = playerPos.clone();
        }
        if (this.venueControls == null) {
            var controlRoot = this.toControl(universe, world);
            this.venueControls = VenueControls.fromControl(controlRoot);
        }
        this.venueControls.updateForTimerTick(universe);
        var hyperspaceSize = this.placeHyperspaceToReturnTo.hyperspace.size;
        if (this._camera == null) {
            var controlRoot = this.venueControls.controlRoot;
            var visualMap = controlRoot.childByName("visualMap");
            var cameraViewSize = visualMap.size.clone();
            this._camera = new Camera(cameraViewSize, cameraViewSize.x, // focalLength
            new Disposition(new Coords(hyperspaceSize.x / 2, hyperspaceSize.y / 2, 0 - hyperspaceSize.x), // pos
            new Orientation(new Coords(0, 0, 1), new Coords(0, 1, 0)), null), null // entitiesInViewSort
            );
            var cameraAsEntity = CameraHelper.toEntity(this._camera);
            this.entitySpawn(universe, world, cameraAsEntity);
        }
        var inputHelper = universe.inputHelper;
        var inputsPressed = inputHelper.inputsPressed;
        for (var i = 0; i < inputsPressed.length; i++) {
            var inputPressed = inputsPressed[i];
            var inputPressedName = inputPressed.name;
            //if (inputPressed.isActive == false)
            if (inputPressedName.startsWith("Arrow")) {
                var directionToMove;
                if (inputPressedName.endsWith("Down")) {
                    directionToMove = Coords.fromXY(0, 1);
                }
                else if (inputPressedName.endsWith("Left")) {
                    directionToMove = Coords.fromXY(-1, 0);
                }
                else if (inputPressedName.endsWith("Right")) {
                    directionToMove = Coords.fromXY(1, 0);
                }
                else if (inputPressedName.endsWith("Up")) {
                    directionToMove = Coords.fromXY(0, -1);
                }
                directionToMove.multiplyScalar(32);
                this.reticlePos.add(directionToMove);
            }
            else if (inputPressedName == "PageDown") {
                var camera = this._camera;
                var cameraViewSize = camera.viewSize;
                var magnificationFactor = camera.focalLength / camera.viewSize.x;
                if (magnificationFactor < 8) {
                    camera.focalLength *= 1.1;
                }
                var cameraPos = camera.loc.pos;
                var cameraPosZ = cameraPos.z;
                cameraPos.overwriteWith(this.reticlePos);
                var cameraMargin = hyperspaceSize.clone().divideScalar(magnificationFactor * 2);
                cameraPos.trimToRangeMinMax(cameraMargin, hyperspaceSize.clone().subtract(cameraMargin));
                cameraPos.z = cameraPosZ;
            }
            else if (inputPressedName == "PageUp") {
                var camera = this._camera;
                var cameraViewSize = camera.viewSize;
                var magnificationFactor = camera.focalLength / camera.viewSize.x;
                if (magnificationFactor > 1) {
                    camera.focalLength /= 1.1;
                }
                var cameraPos = camera.loc.pos;
                var cameraPosZ = cameraPos.z;
                cameraPos.overwriteWith(this.reticlePos);
                var cameraMargin = hyperspaceSize.clone().divideScalar(magnificationFactor * 2);
                cameraPos.trimToRangeMinMax(cameraMargin, hyperspaceSize.clone().subtract(cameraMargin));
                cameraPos.z = cameraPosZ;
            }
        }
    }
    // controls
    toControl(universe, world) {
        var containerSize = universe.display.sizeInPixels.clone();
        var fontHeight = 20;
        var fontHeightShort = 10;
        var marginWidth = 8;
        var buttonSize = Coords.fromXY(1, 1).multiplyScalar(25);
        var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
        var titleSize = Coords.fromXY(containerSize.x, 25);
        var containerRightSize = Coords.fromXY((containerSize.x - marginSize.x * 3) / 3, containerSize.y - marginSize.y * 3 - titleSize.y);
        var containerMapSize = Coords.fromXY(containerSize.x - marginSize.x * 3 - containerRightSize.x, containerRightSize.y);
        /*
        var displayMain = universe.display;
        var displayMap = new Display2D
        (
            [ containerMapSize ],
            displayMain.fontName,
            displayMain.fontHeightInPixels,
            Color.byName("Gray"),
            Color.byName("Black"), // colorsForeAndBack
            null // ?
        );
        //this.displayMap = displayMap.initializeCanvasAndGraphicsContext();
        */
        var containerPlayer = world.player.toControlSidebar(world);
        var containerReticle = ControlContainer.from4("containerReticle", Coords.fromXY(marginSize.x, marginSize.y * 2 + containerPlayer.size.y), containerPlayer.size, [
            new ControlLabel("labelReticle", Coords.fromXY(containerPlayer.size.x / 2, marginSize.y), titleSize, true, // isTextCentered
            "Reticle", fontHeightShort),
            new ControlLabel("labelPos", Coords.fromXY(marginSize.x, marginSize.y * 2), titleSize, false, // isTextCentered
            "Pos:", fontHeightShort),
            new ControlLabel("infoPos", Coords.fromXY(marginSize.x * 4, marginSize.y * 2), titleSize, false, // isTextCentered
            DataBinding.fromContextAndGet(this, (c) => c.reticlePosAsStringXY()), fontHeightShort),
            new ControlLabel("labelFuel", Coords.fromXY(marginSize.x, marginSize.y * 3), titleSize, false, // isTextCentered
            "Fuel:", fontHeightShort),
            new ControlLabel("infoFuel", Coords.fromXY(marginSize.x * 4, marginSize.y * 3), titleSize, false, // isTextCentered
            DataBinding.fromContextAndGet(this, (c) => c.fuelFromPlayerShipGroupToReticle(world)), fontHeightShort),
        ]);
        var containerSidebar = ControlContainer.from4("containerRight", Coords.fromXY(marginSize.x * 2 + containerMapSize.x, marginSize.y * 2 + titleSize.y), containerRightSize, 
        // children
        [
            containerPlayer,
            containerReticle
        ]);
        var controlRoot = ControlContainer.from4("containerMain", Coords.fromXY(0, 0), // pos
        containerSize, [
            new ControlLabel("labelHyperspaceMap", Coords.fromXY(containerSize.x / 2, marginSize.y + titleSize.y / 2), titleSize, true, // isTextCentered
            "Hyperspace Map", fontHeight),
            ControlVisual.from4("visualMap", Coords.fromXY(marginSize.x, marginSize.y * 2 + titleSize.y), containerMapSize, DataBinding.fromContext(new VisualImageImmediate(Image2.fromSystemImage("[fromCanvas]", this.displayMap.canvas), null // ?
            ))),
            containerSidebar,
            ControlButton.from9("buttonBack", marginSize, buttonSize, "<", fontHeight, true, // hasBorder,
            true, // isEnabled,
            (universe) => {
                var world = universe.world;
                var place = world.placeCurrent;
                var placeNext = place.placeHyperspaceToReturnTo;
                world.placeNext = placeNext;
            }, universe // context
            ),
        ]);
        return controlRoot;
    }
}
