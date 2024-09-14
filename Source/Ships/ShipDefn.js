"use strict";
class ShipDefn {
    constructor(name, factionName, mass, acceleration, speedMax, turnsPerTick, crewInitial, crewMax, energyPerTick, energyMax, costToBuild, salvageValue, visual, attackDefn, specialDefn) {
        var speedDivisor = 32; // Trial and error.
        this.name = name;
        this.factionName = factionName;
        this.mass = mass;
        this.acceleration = acceleration / speedDivisor;
        this.speedMax = speedMax / speedDivisor;
        this.turnsPerTick = turnsPerTick;
        this.crewInitial = crewInitial;
        this.crewMax = crewMax;
        this.energyPerTick = energyPerTick;
        this.energyMax = energyMax;
        this.costToBuild = costToBuild;
        this.salvageValue = salvageValue;
        this.visual = visual;
        this.attackDefn = attackDefn;
        this.specialDefn = specialDefn;
        this.sensorRange = 300; // todo
    }
    static Instances(universe) {
        if (ShipDefn._instances == null) {
            ShipDefn._instances = new ShipDefn_Instances(universe);
        }
        return ShipDefn._instances;
    }
    // static methods
    static visual(dimension, colorFill, colorBorder) {
        var visualPath = new Path([
            Coords.fromXY(1.2, 0).multiplyScalar(dimension).half(),
            Coords.fromXY(-.8, .8).multiplyScalar(dimension).half(),
            Coords.fromXY(-.8, -.8).multiplyScalar(dimension).half(),
        ]);
        /*
        var visualsPerTurn = 32;
        var turnsPerPlayerVisual = 1 / visualsPerTurn;
        var visualsForAngles = [];
        var transformRotate2D = new Transform_Rotate2D();

        for (var i = 0; i < visualsPerTurn; i++)
        {
            transformRotate2D.turnsToRotate = i * turnsPerPlayerVisual;

            var visualForAngle = new VisualPolygon
            (
                visualPath.clone().transform(transformRotate2D),
                colorFill, colorBorder
            );

            visualsForAngles.push(visualForAngle);
        }

        var returnValue = new VisualDirectional
        (
            new VisualPolygon(visualPath, colorFill, colorBorder),
            visualsForAngles
        );
        */
        // Don't use a VisualDirectional, because the path is being transformed anyway!
        var returnValue = new VisualPolygon(visualPath, colorFill, colorBorder, true // shouldUseEntityOrientation
        );
        return returnValue;
    }
    // instance methods
    faction(world) {
        return null; // todo
    }
    fullName() {
        return this.factionName + " " + this.name;
    }
    fullNameAndValue() {
        return this.fullName() + "(" + this.costToBuild + ")";
    }
}
class ShipDefn_Instances {
    constructor(universe) {
        var shipDimension = 10;
        var colors = Color.Instances();
        var attackDefnTodo = new ShipAttackDefn("todo", 4, // energyToUse
        2, // projectileRadius
        0, // angleInTurns
        8, // speed
        16, // ticksToLive
        true, // diesOnImpact
        20, // damage
        VisualCircle.fromRadiusAndColorFill(2, colors.Yellow), // visualProjectile
        new VisualGroup([
            new VisualSound("Sound", null),
            VisualCircle.fromRadiusAndColorFill(6, colors.Red)
        ]), // visualImpact
        (universe, world, place, actor) => { }, // effectWhenInvoked
        null, // activity
        (universe, world, place, actor) => { });
        var contentDirectoryPath = universe.mediaLibrary.contentDirectoryPath;
        var shipImagesDirectory = contentDirectoryPath + "Import/sc2/content/base/ships/";
        var shipDimension = 16;
        var shipSizes16x16 = [
            Coords.fromXY(1, 1).multiplyScalar(shipDimension)
        ];
        var headings16 = 16;
        // "sv" = "shipVisual".
        var sv = (shipName, shipImageFilePrefix, shipSizesForHeadings, headingCount) => {
            var imagesForHeadings = new Array();
            var visualsForHeadings = new Array();
            for (var i = 0; i < headingCount; i++) {
                var imageName = shipName + i;
                var headingInTurns = (i / headingCount + 0.25) % 1; // hack
                var imageIndex = Math.round(headingInTurns * headingCount);
                var imagePath = shipImagesDirectory
                    + shipImageFilePrefix
                    + "-big-0"
                    + StringHelper.padStart("" + imageIndex, 2, "0")
                    + ".png";
                var imageForHeading = new Image2(imageName, imagePath);
                imageForHeading.load(() => {
                    // todo
                });
                imagesForHeadings.push(imageForHeading);
                var visualForHeading = new VisualImageFromLibrary(imageName);
                var shipSizeIndex = i % shipSizesForHeadings.length;
                var imageSizeForHeading = shipSizesForHeadings[shipSizeIndex].clone();
                visualForHeading =
                    new VisualImageScaled(imageSizeForHeading, visualForHeading);
                visualsForHeadings.push(visualForHeading);
            }
            // todo
            universe.mediaLibrary.imagesAdd(imagesForHeadings);
            var shipVisual = new VisualDirectional(null, // no direction
            visualsForHeadings, null // ?
            );
            return shipVisual;
        };
        var sv16 = (shipName, shipImageFilePrefix, shipSizesForHeadings) => sv(shipName, shipImageFilePrefix, shipSizesForHeadings, 16);
        var colorGray = colors.Gray;
        var colorBlack = colors.Black;
        var shipDefnFlagship = new ShipDefn("Flagship", "Player", // factionName
        1, // mass
        .5, // accel
        24, // speedMax
        .005, // turnsPerTick
        10, // crewInitial
        50, // crewMax
        2, // energyPerTick
        50, // energyMax
        0, // costToBuild
        0, // salvageValue
        //ShipDefn.visual(shipDimension, colorGray, colorBlack),
        sv16("Flagship", "flagship/flagship", [
            // These dimensions apparently defy logic.
            // Note that the ship's dimensions are different
            // when it's pointing up, rather than to the right!
            // Were these pixels originally non-square?
            Coords.fromXY(54, 27),
            Coords.fromXY(46, 30),
            Coords.fromXY(39, 39),
            Coords.fromXY(32, 45),
            Coords.fromXY(28, 47),
            Coords.fromXY(32, 45),
            Coords.fromXY(39, 39),
            Coords.fromXY(46, 30)
        ].map(x => x.normalize().multiplyScalar(shipDimension))), attackDefnTodo, null // ?
        );
        var shipDefnLander = new ShipDefn("Lander", "Player", // factionName
        1, // mass
        4, // accel
        128, // speedMax
        .01, // turnsPerTick
        12, // crewInitial
        12, // crewMax
        1, // energyPerTick
        4, // energyMax
        1000, // costToBuild
        null, // salvageValue
        ShipDefn.visual(shipDimension, colorGray, colorBlack), attackDefnTodo, null // ?
        );
        var shipDefnLahkemupGuardDroneVisual = sv("GuardDrone", "drone/drone", shipSizes16x16, 1);
        var shipDefnLahkemupGuardDrone = new ShipDefn("GuardDrone", "Lahkemup", // factionName
        1, // mass
        .1, // accel
        2, // speedMax
        .01, // turnsPerTick
        1, // crewInitial
        1, // crewMax
        0, // energyPerTick
        0, // energyMax
        null, // costToBuild
        null, // salvageValue
        shipDefnLahkemupGuardDroneVisual, attackDefnTodo, null // ?
        );
        var adTodo = attackDefnTodo;
        // Ship sizes, attacks, and specials.
        // aegis
        var shipAegisSizes = [
            Coords.fromXY(14, 17),
            Coords.fromXY(17, 16),
            Coords.fromXY(19, 16),
            Coords.fromXY(19, 15),
            Coords.fromXY(19, 13),
            Coords.fromXY(19, 15),
            Coords.fromXY(19, 16),
            Coords.fromXY(17, 16)
        ];
        // afterburner
        var shipAfterburnerSizes = [
            Coords.fromXY(22, 22),
            Coords.fromXY(25, 23),
            Coords.fromXY(25, 25),
            Coords.fromXY(24, 25),
            Coords.fromXY(22, 22),
            Coords.fromXY(24, 25),
            Coords.fromXY(25, 25),
            Coords.fromXY(25, 23)
        ];
        // broadsider
        var shipBroadsiderSizes = [
            Coords.fromXY(42, 11),
            Coords.fromXY(39, 24),
            Coords.fromXY(32, 30),
            Coords.fromXY(25, 35),
            Coords.fromXY(13, 36),
            Coords.fromXY(24, 35),
            Coords.fromXY(32, 30),
            Coords.fromXY(39, 24)
        ];
        // collapsar
        var shipCollapsarSizes = [
            Coords.fromXY(23, 15),
            Coords.fromXY(19, 19),
            Coords.fromXY(16, 20),
            Coords.fromXY(17, 21),
            Coords.fromXY(16, .21),
            Coords.fromXY(20, 18),
            Coords.fromXY(21, 15),
            Coords.fromXY(23, 16)
        ];
        /*
        var shipCollapsarBSizes =
        [
            Coords.fromXY(25, 11),
            Coords.fromXY(22, 13),
            Coords.fromXY(20, 17),
            Coords.fromXY(16, 20),
            Coords.fromXY(12, 22),
            Coords.fromXY(14, 21),
            Coords.fromXY(16, 18),
            Coords.fromXY(19, 14)
        ];
        */
        // discus
        var shipDiscusSizes = [
            Coords.fromXY(19, 13),
            Coords.fromXY(17, 13),
            Coords.fromXY(17, 13),
            Coords.fromXY(17, 13),
            Coords.fromXY(17, 14),
            Coords.fromXY(17, 13),
            Coords.fromXY(17, 13),
            Coords.fromXY(17, 13)
        ];
        // efflorescence
        var shipEfflorescenceSizes = [
            Coords.fromXY(30, 13),
            Coords.fromXY(29, 19),
            Coords.fromXY(23, 23),
            Coords.fromXY(18, 26),
            Coords.fromXY(13, 30),
            Coords.fromXY(18, 27),
            Coords.fromXY(23, 23),
            Coords.fromXY(29, 19)
        ];
        // elysian
        var shipElysianSizes = [
            Coords.fromXY(36, 17),
            Coords.fromXY(34, 22),
            Coords.fromXY(30, 28),
            Coords.fromXY(23, 31),
            Coords.fromXY(17, 30),
            Coords.fromXY(23, 31),
            Coords.fromXY(29, 28),
            Coords.fromXY(34, 22)
        ];
        // encumbrator
        var shipEncumbratorSizes = [
            Coords.fromXY(21, 13),
            Coords.fromXY(22, 14),
            Coords.fromXY(20, 18),
            Coords.fromXY(15, 19),
            Coords.fromXY(15, 18),
            Coords.fromXY(16, 19),
            Coords.fromXY(21, 17),
            Coords.fromXY(24, 14)
        ];
        var shipEncumbratorSpecialBurr = new ShipAttackDefn("Burr", 4, // energyToUse
        2, // projectileRadius
        .5, // angleInTurns
        0, // speed
        null, // ticksToLive
        false, // diesOnImpact
        0, // damage
        new VisualCircle(3, colors.GreenDark, colors.Green, null), // visualProjectile
        new VisualGroup([
            new VisualSound("Sound", null),
            VisualCircle.fromRadiusAndColorFill(6, colors.Red)
        ]), // visualImpact
        (universe, world, place, actor) => { }, // effectWhenInvoked
        (universe, world, place, actor) => // activity
         {
            var actorLoc = actor.locatable().loc;
            var actorPos = actorLoc.pos;
            var targetEntityName = actor.actor().activity.targetEntity().name;
            var target = place.entityByName(targetEntityName);
            var targetPos = target.locatable().loc.pos;
            var displacementToTarget = targetPos.clone().subtract(actorPos);
            var directionToMove = displacementToTarget.normalize();
            actorPos.add(directionToMove);
        }, (universe, world, place, actor) => { });
        var shipElysianSpecialEnticer = new ShipSpecialDefn("Enticer", 10, // energyToUse
        (universe, world, place, actor) => // effect
         {
            // todo
        });
        // fireblossom
        var shipFireblossomSizes = [
            Coords.fromXY(20, 27),
            Coords.fromXY(22, 27),
            Coords.fromXY(26, 26),
            Coords.fromXY(27, 22),
            Coords.fromXY(27, 20),
            Coords.fromXY(27, 22),
            Coords.fromXY(26, 26),
            Coords.fromXY(22, 27)
        ];
        var shipFireblossomSpecialRefuel = new ShipSpecialDefn("Refuel", -2, // energyToUse
        (universe, world, place, actor) => // effect
         {
            // Do nothing.
        });
        // gravitar
        var shipGravitarSizes = [
            Coords.fromXY(39, 37),
            Coords.fromXY(40, 35),
            Coords.fromXY(37, 36),
            Coords.fromXY(37, 39),
            Coords.fromXY(37, 38),
            Coords.fromXY(37, 39),
            Coords.fromXY(37, 36),
            Coords.fromXY(42, 37)
        ];
        var shipGravitarSpecialTractorBeam = new ShipSpecialDefn("TractorBeam", 1, // energyToUse
        (universe, world, placeAsPlace, actor) => // effect
         {
            var place = placeAsPlace;
            var ships = place.entitiesShips();
            var target = ships[1 - ships.indexOf(actor)];
            var actorLoc = actor.locatable().loc;
            var actorPos = actorLoc.pos;
            var targetLoc = target.locatable().loc;
            var targetPos = targetLoc.pos;
            var displacement = targetPos.clone().subtract(actorPos);
            var direction = displacement.normalize();
            var gravityMagnitude = 10;
            targetLoc.accel.subtract(direction.multiplyScalar(gravityMagnitude));
        });
        // indemnity
        var shipIndemnitySizes = [
            Coords.fromXY(30, 31),
            Coords.fromXY(30, 32),
            Coords.fromXY(32, 31),
            Coords.fromXY(33, 30),
            Coords.fromXY(31, 30),
            Coords.fromXY(32, 20),
            Coords.fromXY(31, 32),
            Coords.fromXY(30, 33)
        ];
        // infernus
        var shipInfernusSizes = [
            Coords.fromXY(33, 36),
            Coords.fromXY(32, 30),
            Coords.fromXY(29, 28),
            Coords.fromXY(34, 30),
            Coords.fromXY(38, 31),
            Coords.fromXY(34, 30),
            Coords.fromXY(29, 28),
            Coords.fromXY(32, 30)
        ];
        var shipInfernusSpecialCloak = new ShipSpecialDefn("Cloak", 1, // energyToUse
        (universe, world, place, actor) => // effect
         {
            //var ship = EntityExtensions.ship(actor);
            //var isCloaked = false; // ship.isCloaked;
            //isCloaked = (isCloaked == null ? false : isCloaked);
            //ship.isCloaked = (isCloaked == false);
        });
        var shipInfernusVisualBase = sv("Infernus", "ilwrath/avenger", shipInfernusSizes, headings16);
        var shipInfernusVisualCloaked = ShipDefn.visual(shipDimension, colorBlack, colorBlack);
        var shipInfernusVisual = new VisualDynamic((uwpe) => {
            // var ship = EntityExtensions.ship(entity);
            var isCloaked = false; // ship.isCloaked;
            var returnValue = (isCloaked ? shipInfernusVisualCloaked : shipInfernusVisualBase);
            return returnValue;
        });
        // kickback
        var shipKickbackSizes = [
            Coords.fromXY(36, 15),
            Coords.fromXY(33, 22),
            Coords.fromXY(28, 28),
            Coords.fromXY(21, 31),
            Coords.fromXY(15, 34),
            Coords.fromXY(21, 31),
            Coords.fromXY(28, 28),
            Coords.fromXY(33, 22)
        ];
        var shipKickbackSpecialRightsize = new ShipSpecialDefn("Rightsize", -20, // energyToUse
        (universe, world, place, actor) => // effect
         {
            // Do nothing.
        });
        // metamorph
        var shipMetamorphASizes = [
            Coords.fromXY(19, 24),
            Coords.fromXY(21, 23),
            Coords.fromXY(22, 22),
            Coords.fromXY(25, 21),
            Coords.fromXY(26, 18),
            Coords.fromXY(25, 21),
            Coords.fromXY(26, 18),
            Coords.fromXY(25, 21)
        ];
        var shipMetamorphBSizes = [
            Coords.fromXY(25, 15),
            Coords.fromXY(27, 18),
            Coords.fromXY(25, 23),
            Coords.fromXY(19, 25),
            Coords.fromXY(17, 24),
            Coords.fromXY(19, 25),
            Coords.fromXY(25, 23),
            Coords.fromXY(27, 18)
        ];
        // nitpiknik
        var shipNitpiknikSizes = [
            Coords.fromXY(24, 23),
            Coords.fromXY(24, 23),
            Coords.fromXY(25, 25),
            Coords.fromXY(24, 23),
            Coords.fromXY(23, 24),
            Coords.fromXY(25, 23),
            Coords.fromXY(25, 25),
            Coords.fromXY(24, 23)
        ];
        // punishpunj
        var shipPunishpunjSizes = [
            Coords.fromXY(31, 31),
            Coords.fromXY(32, 29),
            Coords.fromXY(28, 27),
            Coords.fromXY(31, 31),
            Coords.fromXY(33, 31),
            Coords.fromXY(31, 32),
            Coords.fromXY(29, 28),
            Coords.fromXY(32, 29)
        ];
        // pustule
        var shipPustuleSizes = [
            Coords.fromXY(16, 12),
            Coords.fromXY(17, 15),
            Coords.fromXY(15, 15),
            Coords.fromXY(13, 15),
            Coords.fromXY(12, 14),
            Coords.fromXY(13, 15),
            Coords.fromXY(15, 15),
            Coords.fromXY(17, 13)
        ];
        var shipPustuleSpecialRetrodrive = new ShipSpecialDefn("Retrodrive", 1, // energyToUse
        (universe, world, place, actor) => // effect
         {
            var actorLoc = actor.locatable().loc;
            var actorPos = actorLoc.pos;
            var thrust = 10;
            var direction = actorLoc.orientation.forward.clone();
            var displacement = direction.invert().multiplyScalar(thrust);
            actorPos.add(displacement);
        });
        // scuttler
        var shipScuttlerSizes = [
            Coords.fromXY(26, 24),
            Coords.fromXY(30, 29),
            Coords.fromXY(31, 30),
            Coords.fromXY(30, 28),
            Coords.fromXY(27, 23),
            Coords.fromXY(33, 25),
            Coords.fromXY(34, 28),
            Coords.fromXY(31, 27)
        ];
        var shipScuttlerSpecialMoonbeam = new ShipAttackDefn("Moonbeam", 4, // energyToUse
        2, // projectileRadius
        .5, // angleInTurns
        0, // speed
        null, // ticksToLive
        false, // diesOnImpact
        0, // damage
        new VisualCircle(3, colors.Red, colors.RedDark, null), // visualProjectile
        new VisualGroup([
            new VisualSound("Sound", null),
            VisualCircle.fromRadiusAndColorFill(6, colors.Red)
        ]), // visualImpact
        (universe, world, place, actor) => { }, // effectWhenInvoked
        (universe, world, place, actor) => // activity
         {
            var actorLoc = actor.locatable().loc;
            var actorPos = actorLoc.pos;
            var targetEntityName = actor.actor().activity.targetEntity().name;
            var target = place.entityByName(targetEntityName);
            var targetPos = target.locatable().loc.pos;
            var displacementToTarget = targetPos.clone().subtract(actorPos);
            var directionToMove = displacementToTarget.normalize();
            actorPos.add(directionToMove);
        }, (universe, world, place, actor) => { });
        // shackler
        var shipShacklerSizes = [
            Coords.fromXY(35, 28),
            Coords.fromXY(35, 30),
            Coords.fromXY(34, 31),
            Coords.fromXY(31, 31),
            Coords.fromXY(29, 33),
            Coords.fromXY(31, 32),
            Coords.fromXY(34, 31),
            Coords.fromXY(35, 29)
        ];
        var shipShacklerSpecialFighter = new ShipAttackDefn("Fighter", 4, // energyToUse
        2, // projectileRadius
        .5, // angleInTurns
        0, // speed
        null, // ticksToLive
        false, // diesOnImpact
        0, // damage
        new VisualCircle(3, colors.Red, colors.RedDark, null), // visualProjectile
        new VisualGroup([
            new VisualSound("Sound", null),
            VisualCircle.fromRadiusAndColorFill(6, colors.Red)
        ]), // visualImpact
        (universe, world, place, actor) => { }, // effectWhenInvoked
        (universe, world, place, actor) => // activity
         {
            var actorLoc = actor.locatable().loc;
            var actorPos = actorLoc.pos;
            var targetEntityName = actor.actor().activity.targetEntity().name;
            var target = place.entityByName(targetEntityName);
            var targetPos = target.locatable().loc.pos;
            var displacementToTarget = targetPos.clone().subtract(actorPos);
            var directionToMove = displacementToTarget.normalize();
            actorPos.add(directionToMove);
        }, (universe, world, place, actor) => { });
        // silencer
        var shipSilencerSizes = [
            Coords.fromXY(39, 21),
            Coords.fromXY(39, 31),
            Coords.fromXY(36, 36),
            Coords.fromXY(30, 38),
            Coords.fromXY(22, 38),
            Coords.fromXY(30, 37),
            Coords.fromXY(36, 36),
            Coords.fromXY(38, 31)
        ];
        // sporsac
        var shipSporsacSizes = [
            Coords.fromXY(28, 23),
            Coords.fromXY(28, 23),
            Coords.fromXY(26, 23),
            Coords.fromXY(26, 25),
            Coords.fromXY(26, 25),
            Coords.fromXY(26, 25),
            Coords.fromXY(26, 23),
            Coords.fromXY(28, 23)
        ];
        var shipSporsacSpecialRegenerate = new ShipSpecialDefn("Regenerate", 40, // energyToUse
        (universe, world, place, actor) => // effect
         {
            // todo
        });
        // starshard
        var shipStarshardSpecialLeech = new ShipAttackDefn("Leech", 4, // energyToUse
        2, // projectileRadius
        .5, // angleInTurns
        0, // speed
        null, // ticksToLive
        false, // diesOnImpact
        0, // damage
        new VisualCircle(5, colors.White, colors.Cyan, null), // visualProjectile
        new VisualGroup([
            new VisualSound("Sound", null),
            VisualCircle.fromRadiusAndColorFill(6, colors.Red)
        ]), // visualImpact
        (universe, world, place, actor) => { }, // effectWhenInvoked
        (universe, world, place, actor) => // activity
         {
            var actorLoc = actor.locatable().loc;
            var actorPos = actorLoc.pos;
            var targetEntityName = actor.actor().activity.targetEntity().name;
            var target = place.entityByName(targetEntityName);
            var targetPos = target.locatable().loc.pos;
            var displacementToTarget = targetPos.clone().subtract(actorPos);
            var directionToMove = displacementToTarget.normalize();
            actorPos.add(directionToMove);
        }, (universe, world, place, actor) => { });
        // sunbright
        var shipSunbrightSizes = [
            Coords.fromXY(16, 9),
            Coords.fromXY(13, 8),
            Coords.fromXY(11, 11),
            Coords.fromXY(8, 13),
            Coords.fromXY(9, 15),
            Coords.fromXY(8, 13),
            Coords.fromXY(11, 11),
            Coords.fromXY(13, 8)
        ];
        var shipSunbrightSpecialBigBadaBoom = new ShipSpecialDefn("BigBadaBoom", 0, // energyToUse
        (universe, world, place, actor) => // effect
         {
            // todo
        });
        // tumbler
        var shipTumblerSizes = [
            Coords.fromXY(42, 37),
            Coords.fromXY(46, 33),
            Coords.fromXY(48, 29),
            Coords.fromXY(50, 25),
            Coords.fromXY(50, 23),
            Coords.fromXY(50, 25),
            Coords.fromXY(48, 29),
            Coords.fromXY(46, 33)
        ];
        var shipTumblerSpecialCatabolize = new ShipSpecialDefn("Catabolize", 0, // energyToUse
        (universe, world, place, actor) => // effect
         {
            // todo
        });
        // wingshadow
        var shipWingshadowSizes = [
            Coords.fromXY(23, 29),
            Coords.fromXY(29, 27),
            Coords.fromXY(30, 29),
            Coords.fromXY(27, 27),
            Coords.fromXY(29, 23),
            Coords.fromXY(27, 28),
            Coords.fromXY(29, 30),
            Coords.fromXY(29, 27)
        ];
        var sd = ShipDefn;
        this._All =
            [
                shipDefnFlagship,
                shipDefnLander,
                shipDefnLahkemupGuardDrone,
                //		name, 			factionName, 	mass, 	accel, 	speedMax,turnsPerTick, 		crew, 		e/tick,	eMax, 	cost, 	salvage,visual,														attack, special
                new sd("Gravitar", "Konstalyxz", 10, 1.166, 35, .25 / headings16, 42, 42, .5, 42, 3000, null, sv16("Gravitar", "chmmr/avatar", shipGravitarSizes), adTodo, shipGravitarSpecialTractorBeam),
                new sd("Infernus", "Raknoid", 17, 5, 25, .33 / headings16, 22, 22, .8, 16, 1000, 125, shipInfernusVisual, adTodo, shipInfernusSpecialCloak),
                new sd("Efflorescence", "Twyggan", 4, 8, 40, .5 / headings16, 12, 12, .2, 16, 1600, 200, sv16("Efflorescence", "supox/blade", shipEfflorescenceSizes), adTodo, adTodo),
                new sd("Starshard", "Xtalix", 10, .6, 27, .142 / headings16, 36, 36, .2, 30, 2600, null, sv16("Starshard", "chenjesu/broodhome", shipSizes16x16), adTodo, shipStarshardSpecialLeech),
                new sd("Broadsider", "Terran", 6, .6, 24, .5 / headings16, 18, 18, .111, 18, 1100, null, sv16("Broadsider", "human/cruiser", shipBroadsiderSizes), adTodo, adTodo),
                new sd("Shackler", "Lahkemup", 10, .86, 30, .2 / headings16, 42, 42, .14, 42, 3000, 375, sv16("Shackler", "urquan/dreadnought", shipShacklerSizes), adTodo, shipShacklerSpecialFighter),
                new sd("Pustule", "Amorfus", 1, 1.5, 18, .2 / headings16, 10, 10, .2, 30, 700, 87, sv16("Pustule", "umgah/drone", shipPustuleSizes), adTodo, shipPustuleSpecialRetrodrive),
                new sd("Scuttler", "Mauluska", 7, 6, 48, .5 / headings16, 30, 30, .091, 10, 1800, 225, sv16("Scuttler", "spathi/eluder", shipScuttlerSizes), adTodo, shipScuttlerSpecialMoonbeam),
                new sd("Fireblossom", "Muuncaf", 1, 16, 64, 1 / headings16, 8, 8, 0, 12, 2000, 250, sv16("Fireblossom", "pkunk/fury", shipFireblossomSizes), adTodo, shipFireblossomSpecialRefuel),
                new sd("Collapsar", "Manalogues", 6, 3, 24, .2 / headings16, 20, 20, .111, 24, 1500, null, sv16("Collapsar", "androsynth/guardian", shipCollapsarSizes), adTodo, adTodo),
                new sd("Encumbrator", "Ugglegruj", 6, 1.4, 21, .142 / headings16, 20, 20, .111, 40, 1200, 150, sv16("Encumbrator", "vux/intruder", shipEncumbratorSizes), adTodo, shipEncumbratorSpecialBurr),
                new sd("Punishpunj", "Moroz", 8, .86, 36, .5 / headings16, 20, 20, 0, 20, 2200, 275, sv16("Punishpunj", "utwig/jugger", shipPunishpunjSizes), adTodo, adTodo),
                new sd("Silencer", "Kehlemal", 10, 1.2, 30, .2 / headings16, 42, 42, .2, 42, 3000, 375, sv16("Silencer", "kohrah/marauder", shipSilencerSizes), adTodo, adTodo),
                new sd("Kickback", "Daskapital", 5, 1, 20, .2 / headings16, 14, 14, .02, 32, 1700, 212, sv16("Kickback", "druuge/mauler", shipKickbackSizes), adTodo, shipKickbackSpecialRightsize),
                new sd("Wingshadow", "Outsider", 4, 5, 35, .5 / headings16, 16, 16, .142, 20, 2300, 287, sv16("Wingshadow", "orz/nemesis", shipWingshadowSizes), adTodo, adTodo),
                new sd("Elysian", "Mazonae", 2, 4.5, 36, .5 / headings16, 12, 42, .142, 16, 1300, null, sv16("Elysian", "syreen/penetrator", shipElysianSizes), adTodo, shipElysianSpecialEnticer),
                new sd("Sporsac", "Hyphae", 7, 1.29, 27, .14 / headings16, 20, 20, .2, 40, 2100, 262, sv16("Sporsac", "mycon/podship", shipSporsacSizes), adTodo, shipSporsacSpecialRegenerate),
                new sd("Tumbler", "Tempestrial", 1, 60, 60, .5 / headings16, 12, 12, 0, 20, 1700, 550, sv16("Tumbler", "slylandro/probe", shipTumblerSizes), adTodo, shipTumblerSpecialCatabolize),
                new sd("Sunbright", "Supial", 1, 5, 35, .5 / headings16, 6, 6, .1, 4, 500, 62, sv16("Sunbright", "shofixti/scout", shipSunbrightSizes), adTodo, shipSunbrightSpecialBigBadaBoom),
                new sd("Discus", "Ellfyn", 1, 40, 40, .5 / headings16, 6, 6, .142, 20, 1500, 200, sv16("Discus", "arilou/skiff", shipDiscusSizes), adTodo, adTodo),
                new sd("Nitpiknik", "Triunion", 5, 10, 40, .5 / headings16, 10, 10, .2, 10, 600, 75, sv16("Nitpiknik", "zoqfotpik/stinger", shipNitpiknikSizes), adTodo, adTodo),
                new sd("Aegis", "Raptor", 3, 2, 30, .33 / headings16, 20, 20, .29, 10, 2300, 287, sv16("Aegis", "yehat/terminator", shipAegisSizes), adTodo, adTodo),
                new sd("Afterburner", "Warpig", 7, 7, 28, .5 / headings16, 8, 8, .142, 24, 1000, 125, sv16("Afterburner", "thraddash/torch", shipAfterburnerSizes), adTodo, adTodo),
                new sd("Indemnity", "Murch", 7, 1.2, 36, .2 / headings16, 20, 20, .2, 42, 1800, 450, sv16("Indemnity", "melnorme/trader", shipIndemnitySizes), adTodo, adTodo),
                new sd("MetamorphA", "Knsnynz", 3, 2.5, 20, .33 / headings16, 20, 20, .29, 10, 1900, null, sv16("MetamorphA", "mmrnmhrm/xform", shipMetamorphASizes), adTodo, adTodo),
                new sd("MetamorphB", "Knsnynz", 3, 10, 50, .07 / headings16, 20, 20, .14, 10, 1900, null, sv16("MetamorphB", "mmrnmhrm/xform", shipMetamorphBSizes), adTodo, adTodo),
            ];
        this._AllByName = ArrayHelper.addLookupsByName(this._All);
    }
}
