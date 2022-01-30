
class ShipDefn
{
	name: string;
	factionName: string;
	mass: number;
	acceleration: number;
	speedMax: number;
	turnsPerTick: number;
	crewInitial: number;
	crewMax: number;
	energyPerTick: number;
	energyMax: number;
	value: number;
	visual: VisualBase;
	attackDefn: ShipAttackDefn;
	specialDefn: ShipSpecialDefn;

	sensorRange: number;

	constructor
	(
		name: string,
		factionName: string,
		mass: number,
		acceleration: number,
		speedMax: number,
		turnsPerTick: number,
		crewInitial: number,
		crewMax: number,
		energyPerTick: number,
		energyMax: number,
		value: number,
		visual: VisualBase,
		attackDefn: ShipAttackDefn,
		specialDefn: ShipSpecialDefn
	)
	{
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
		this.value = value;
		this.visual = visual;
		this.attackDefn = attackDefn;
		this.specialDefn = specialDefn;

		this.sensorRange = 300; // todo
	}

	// instances

	static _instances: ShipDefn_Instances;
	static Instances(universe: Universe): ShipDefn_Instances
	{
		if (ShipDefn._instances == null)
		{
			ShipDefn._instances = new ShipDefn_Instances(universe);
		}

		return ShipDefn._instances;
	}

	// static methods

	static visual(dimension: number, colorFill: Color, colorBorder: Color)
	{
		var visualPath = new Path
		([
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
		var returnValue = new VisualPolygon
		(
			visualPath, colorFill, colorBorder, true // shouldUseEntityOrientation
		);

		return returnValue;
	}

	// instance methods

	faction(world: World): Faction
	{
		return null;// todo
	}

	fullName(): string
	{
		return this.factionName + " " + this.name;
	}

	fullNameAndValue(): string
	{
		return this.fullName() + "(" + this.value + ")";
	}
}

class ShipDefn_Instances
{
	_All: ShipDefn[];
	_AllByName: Map<string, ShipDefn>;

	constructor(universe: Universe)
	{
		var shipDimension = 10;

		var attackDefnTodo = new ShipAttackDefn
		(
			"todo",
			4, // energyToUse
			2, // projectileRadius
			0, // angleInTurns
			8, // speed
			16, // ticksToLive
			true, // diesOnImpact
			20, // damage
			VisualCircle.fromRadiusAndColorFill(2, Color.byName("Yellow") ), // visualProjectile
			new VisualGroup
			([
				new VisualSound("Sound", null),
				VisualCircle.fromRadiusAndColorFill(6, Color.byName("Red") )
			]), // visualImpact
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectWhenInvoked
			null, // activity
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectOnImpact
		);

		var contentDirectoryPath = universe.mediaLibrary.contentDirectoryPath;
		var shipImagesDirectory = contentDirectoryPath + "Import/sc2/content/base/ships/";
		var shipDimension = 16;
		var shipSize16x16 =
		[
			Coords.fromXY(1, 1).multiplyScalar(shipDimension)
		];

		var headings16 = 16;

		// "sv" = "shipVisual".
		var sv =
		(
			shipName: string,
			shipImageFilePrefix: string,
			shipSizesForHeadings: Coords[],
			headingCount: number
		) =>
		{
			var imagesForHeadings = [];
			var visualsForHeadings = [];

			for (var i = 0; i < headingCount; i++)
			{
				var imageName = shipName + i;
				var headingInTurns = (i / headingCount + 0.25) % 1; // hack
				var imageIndex = Math.round(headingInTurns * headingCount);
				var imagePath =
					shipImagesDirectory
					+ shipImageFilePrefix
					+ "-big-0"
					+ StringHelper.padStart("" + imageIndex, 2, "0")
					+ ".png";

				var imageForHeading = new Image2
				(
					imageName, imagePath
				);
				imageForHeading.load();
				imagesForHeadings.push(imageForHeading);
				var visualForHeading: VisualImage =
					new VisualImageFromLibrary(imageName);

				var shipSizeIndex = i % shipSizesForHeadings.length;
				var imageSizeForHeading = shipSizesForHeadings[shipSizeIndex].clone();
				visualForHeading =
					new VisualImageScaled(visualForHeading, imageSizeForHeading);
				visualsForHeadings.push(visualForHeading);
			}

			// todo
			universe.mediaLibrary.imagesAdd(imagesForHeadings);

			var shipVisual = new VisualDirectional
			(
				null, // no direction
				visualsForHeadings,
				null // ?
			);

			return shipVisual;
		}

		var sv16 = (shipName: string, shipImageFilePrefix: string, shipSizesForHeadings: Coords[]) =>
			sv(shipName, shipImageFilePrefix, shipSizesForHeadings, 16);

		var colorGray = Color.byName("Gray");
		var colorBlack = Color.byName("Black");

		var shipDefnFlagship = new ShipDefn
		(
			"Flagship",
			"Player", // factionName
			1, // mass
			.5, // accel
			24, // speedMax
			.005, // turnsPerTick
			10, // crewInitial
			50, // crewMax
			2, // energyPerTick
			50, // energyMax
			0, // value
			//ShipDefn.visual(shipDimension, colorGray, colorBlack),
			sv16
			(
				"Flagship",
				"flagship/flagship",
				[
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
				].map(x => x.normalize().multiplyScalar(shipDimension) )
			),
			attackDefnTodo,
			null // ?
		);

		var shipDefnLander = new ShipDefn
		(
			"Lander",
			"Player", // factionName
			1, // mass
			4, // accel
			128, // speedMax
			.01, // turnsPerTick
			12, // crewInitial
			12, // crewMax
			1, // energyPerTick
			4, // energyMax
			1000, // value
			ShipDefn.visual(shipDimension, colorGray, colorBlack),
			attackDefnTodo,
			null // ?
		);

		var shipDefnLahkemupGuardDroneVisual =
			/*
			ShipDefn.visual
			(
				shipDimension,
				Color.byName("GreenDark"),
				Color.byName("Red")
			);
			*/
			sv("GuardDrone", "drone/drone", shipSize16x16, 1);


		var shipDefnLahkemupGuardDrone = new ShipDefn
		(
			"GuardDrone",
			"Lahkemup", // factionName
			1, // mass
			.1, // accel
			2, // speedMax
			.01, // turnsPerTick
			1, // crewInitial
			1, // crewMax
			0, // energyPerTick
			0, // energyMax
			0, // value
			shipDefnLahkemupGuardDroneVisual,
			attackDefnTodo,
			null // ?
		);

		var adTodo = attackDefnTodo;

		// ship attacks and specials

		// encumbrator

		var shipEncumbratorSpecialBurr = new ShipAttackDefn
		(
			"Burr",
			4, // energyToUse
			2, // projectileRadius
			.5, // angleInTurns
			0, // speed
			null, // ticksToLive
			false, // diesOnImpact
			0, // damage
			new VisualCircle
			(
				3, Color.byName("GreenDark"), Color.byName("Green"), null
			), // visualProjectile
			new VisualGroup
			([
				new VisualSound("Sound", null),
				VisualCircle.fromRadiusAndColorFill(6, Color.byName("Red"))
			]), // visualImpact
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectWhenInvoked
			(universe: Universe, world: World, place: Place, actor: Entity) => // activity
			{
				var actorLoc = actor.locatable().loc;
				var actorPos = actorLoc.pos;
				var targetEntityName = actor.actor().activity.targetEntity().name;
				var target = place.entitiesByName.get(targetEntityName);
				var targetPos = target.locatable().loc.pos;
				var displacementToTarget = targetPos.clone().subtract(actorPos);
				var directionToMove = displacementToTarget.normalize();
				actorPos.add(directionToMove);
			},
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectOnImpact
		);

		var shipElysianSpecialEnticer = new ShipSpecialDefn
		(
			"Enticer",
			10, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				// todo
			}
		);

		// fireblossom

		var shipFireblossomSpecialRefuel = new ShipSpecialDefn
		(
			"Refuel",
			-2, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				// Do nothing.
			}
		);

		// gravitar

		var shipGravitarSpecialTractorBeam = new ShipSpecialDefn
		(
			"TractorBeam",
			1, // energyToUse
			(universe: Universe, world: World, placeAsPlace: Place, actor: Entity) => // effect
			{
				var place = placeAsPlace as PlaceCombat;
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
			}
		);

		// infernus

		var shipInfernusSpecialCloak = new ShipSpecialDefn
		(
			"Cloak",
			1, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				//var ship = EntityExtensions.ship(actor);
				//var isCloaked = false; // ship.isCloaked;
				//isCloaked = (isCloaked == null ? false : isCloaked);
				//ship.isCloaked = (isCloaked == false);
			}
		);

		var shipInfernusVisualBase = sv("Infernus", "ilwrath/avenger", shipSize16x16, headings16);
		var shipInfernusVisualCloaked = ShipDefn.visual(shipDimension, colorBlack, colorBlack);
		var shipInfernusVisual = new VisualDynamic
		(
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				// var ship = EntityExtensions.ship(entity);
				var isCloaked = false; // ship.isCloaked;
				var returnValue =
				(
					isCloaked ? shipInfernusVisualCloaked : shipInfernusVisualBase
				) as VisualBase;
				return returnValue;
			}
		);

		// kickback

		var shipKickbackSpecialRightsize = new ShipSpecialDefn
		(
			"Rightsize",
			-20, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				// Do nothing.
			}
		);

		// pustule

		var shipPustuleSpecialRetrodrive = new ShipSpecialDefn
		(
			"Retrodrive",
			1, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				var actorLoc = actor.locatable().loc;
				var actorPos = actorLoc.pos;
				var thrust = 10;
				var direction = actorLoc.orientation.forward.clone();
				var displacement = direction.invert().multiplyScalar(thrust);
				actorPos.add(displacement);
			}
		);

		// scuttler

		var shipScuttlerSpecialMoonbeam = new ShipAttackDefn
		(
			"Moonbeam",
			4, // energyToUse
			2, // projectileRadius
			.5, // angleInTurns
			0, // speed
			null, // ticksToLive
			false, // diesOnImpact
			0, // damage
			new VisualCircle(3, Color.byName("Red"), Color.byName("RedDark"), null), // visualProjectile
			new VisualGroup
			([
				new VisualSound("Sound", null),
				VisualCircle.fromRadiusAndColorFill(6, Color.byName("Red"))
			]), // visualImpact
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectWhenInvoked
			(universe: Universe, world: World, place: Place, actor: Entity) => // activity
			{
				var actorLoc = actor.locatable().loc;
				var actorPos = actorLoc.pos;
				var targetEntityName = actor.actor().activity.targetEntity().name;
				var target = place.entitiesByName.get(targetEntityName);
				var targetPos = target.locatable().loc.pos;
				var displacementToTarget = targetPos.clone().subtract(actorPos);
				var directionToMove = displacementToTarget.normalize();
				actorPos.add(directionToMove);
			},
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectOnImpact
		);

		// shackler

		var shipShacklerSpecialFighter = new ShipAttackDefn
		(
			"Fighter",
			4, // energyToUse
			2, // projectileRadius
			.5, // angleInTurns
			0, // speed
			null, // ticksToLive
			false, // diesOnImpact
			0, // damage
			new VisualCircle(3, Color.byName("Red"), Color.byName("RedDark"), null), // visualProjectile
			new VisualGroup
			([
				new VisualSound("Sound", null),
				VisualCircle.fromRadiusAndColorFill(6, Color.byName("Red"))
			]), // visualImpact
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectWhenInvoked
			(universe: Universe, world: World, place: Place, actor: Entity) => // activity
			{
				var actorLoc = actor.locatable().loc;
				var actorPos = actorLoc.pos;
				var targetEntityName = actor.actor().activity.targetEntity().name;
				var target = place.entitiesByName.get(targetEntityName);
				var targetPos = target.locatable().loc.pos;
				var displacementToTarget = targetPos.clone().subtract(actorPos);
				var directionToMove = displacementToTarget.normalize();
				actorPos.add(directionToMove);
			},
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectOnImpact
		);

		// sporsac

		var shipSporsacSpecialRegenerate = new ShipSpecialDefn
		(
			"Regenerate",
			40, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				// todo
			}
		);

		// starshard

		var shipStarshardSpecialLeech = new ShipAttackDefn
		(
			"Leech",
			4, // energyToUse
			2, // projectileRadius
			.5, // angleInTurns
			0, // speed
			null, // ticksToLive
			false, // diesOnImpact
			0, // damage
			new VisualCircle(5, Color.byName("White"), Color.byName("Cyan"), null), // visualProjectile
			new VisualGroup
			([
				new VisualSound("Sound", null),
				VisualCircle.fromRadiusAndColorFill(6, Color.byName("Red"))
			]), // visualImpact
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectWhenInvoked
			(universe: Universe, world: World, place: Place, actor: Entity) => // activity
			{
				var actorLoc = actor.locatable().loc;
				var actorPos = actorLoc.pos;
				var targetEntityName = actor.actor().activity.targetEntity().name;
				var target = place.entitiesByName.get(targetEntityName);
				var targetPos = target.locatable().loc.pos;
				var displacementToTarget = targetPos.clone().subtract(actorPos);
				var directionToMove = displacementToTarget.normalize();
				actorPos.add(directionToMove);
			},
			(universe: Universe, world: World, place: Place, actor: Entity) => {}, // effectOnImpact
		);

		// sunbright

		var shipSunbrightSpecialBigBadaBoom = new ShipSpecialDefn
		(
			"BigBadaBoom",
			0, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				// todo
			}
		);

		// tumbler

		var shipTumblerSpecialCatabolize = new ShipSpecialDefn
		(
			"Catabolize",
			0, // energyToUse
			(universe: Universe, world: World, place: Place, actor: Entity) => // effect
			{
				// todo
			}
		);

		var sd = ShipDefn;

		this._All =
		[
			shipDefnFlagship,
			shipDefnLander,
			shipDefnLahkemupGuardDrone,

			//		name, 			factionName, 	mass, 	accel, 	speedMax,turnsPerTick, 		crew, 		e/tick,	eMax, 	value, 	visual,													attack, special
			new sd("Gravitar", 		"Konstalyxz", 	10, 	1.166, 	35, 	.25 / headings16, 	42, 42,		.5,  	42,		1000, 	sv16("Gravitar", "chmmr/avatar", shipSize16x16), 		adTodo, shipGravitarSpecialTractorBeam ),
			new sd("Infernus", 		"Araknoid", 	17,		5, 		25, 	.33 / headings16, 	22, 22, 	.8,  	16, 	1000, 	shipInfernusVisual, 									adTodo,	shipInfernusSpecialCloak ),
			new sd("Efflorescence", "Twyggan", 		4, 		8, 		40, 	.5 / headings16,  	12, 12, 	.2,  	16, 	1000, 	sv16("Efflorescence", "supox/blade", shipSize16x16), 	adTodo,	adTodo ),
			new sd("Starshard", 	"Xtalix", 		10,		.6, 	27, 	.142 / headings16,	36, 36, 	.2,  	30, 	1000, 	sv16("Starshard", "chenjesu/broodhome", shipSize16x16),	adTodo,	shipStarshardSpecialLeech ),
			new sd("Broadsider", 	"Terran", 		6,		.6, 	24, 	.5 / headings16, 	18, 18, 	.111,  	18, 	1000, 	sv16("Broadsider", "human/cruiser", shipSize16x16),		adTodo,	adTodo ),
			new sd("Shackler", 		"Lahkemup", 	10,		.86, 	30, 	.2 / headings16, 	42, 42, 	.14,  	42, 	1000, 	sv16("Shackler", "urquan/dreadnought", shipSize16x16), 	adTodo, shipShacklerSpecialFighter ),
			new sd("Pustule", 		"Amorfus", 		1,		1.5, 	18, 	.2 / headings16, 	10, 10, 	.2,  	30, 	1000, 	sv16("Pustule", "umgah/drone", shipSize16x16), 			adTodo,	shipPustuleSpecialRetrodrive ),
			new sd("Scuttler", 		"Mauluska", 	7,		6, 		48, 	.5 / headings16, 	30, 30, 	.091,  	10, 	1000, 	sv16("Scuttler", "spathi/eluder", shipSize16x16), 		adTodo,	shipScuttlerSpecialMoonbeam ),
			new sd("Fireblossom", 	"Muuncaf",		1,		16,		64,		1 / headings16,	 	8, 8, 		0,		12, 	1000, 	sv16("Fireblossom", "pkunk/fury", shipSize16x16), 		adTodo,	shipFireblossomSpecialRefuel ),
			new sd("Collapsar",		"Manalogous",	6,		3,		24,		.2 / headings16, 	20, 20, 	.111,	24, 	1000, 	sv16("Collapsar", "androsynth/guardian", shipSize16x16),adTodo,	adTodo ),
			new sd("Encumbrator",	"Ugglegruj",	6,		1.4,	21,		.142 / headings16, 	20, 20, 	.111,	40, 	1000, 	sv16("Encumbrator", "vux/intruder", shipSize16x16), 	adTodo,	shipEncumbratorSpecialBurr ),
			new sd("Punishpunj",	"Moroz",		8,		.86,	36,		.5 / headings16, 	20, 20, 	0,		20, 	1000, 	sv16("Punishpunj", "utwig/jugger", shipSize16x16), 		adTodo,	adTodo ),
			new sd("Silencer",		"Kehlemal",		10,		1.2,	30,		.2 / headings16, 	42, 42, 	.2,		42, 	1000, 	sv16("Silencer", "kohrah/marauder", shipSize16x16), 	adTodo,	adTodo ),
			new sd("Kickback",		"Daskapital",	5,		1,		20,		.2 / headings16, 	14, 14, 	.02,	32, 	1000, 	sv16("Kickback", "druuge/mauler", shipSize16x16), 		adTodo,	shipKickbackSpecialRightsize ),
			new sd("Wingshadow",	"Outsider",		4,		5,		35,		.5 / headings16, 	16, 16, 	.142,	20, 	1000, 	sv16("Wingshadow", "orz/nemesis", shipSize16x16), 		adTodo,	adTodo ),
			new sd("Elysian",		"Mazonae",		2,		4.5,	36,		.5 / headings16, 	12, 42, 	.142,	16, 	1000, 	sv16("Elysian", "syreen/penetrator", shipSize16x16),	adTodo,	shipElysianSpecialEnticer ),
			new sd("Sporsac",		"Hyphae",		7,		1.29,	27,		.14 / headings16, 	20, 20, 	.2,		40, 	1000, 	sv16("Sporsac", "mycon/podship", shipSize16x16), 		adTodo,	shipSporsacSpecialRegenerate ),
			new sd("Tumbler",		"Tempestrial",	1,		60,		60,		.5 / headings16, 	12, 12, 	0,		20, 	1000, 	sv16("Tumbler", "slylandro/probe", shipSize16x16),		adTodo,	shipTumblerSpecialCatabolize ),
			new sd("Sunbright",		"Supial",		1,		5,		35,		.5 / headings16, 	6, 6,		.1,		4, 		1000, 	sv16("Sunbright", "shofixti/scout", shipSize16x16),		adTodo,	shipSunbrightSpecialBigBadaBoom ),
			new sd("Discus",		"Ellfyn",		1,		40,		40,		.5 / headings16, 	6, 6,		.142,	20, 	1000, 	sv16("Discus", "arilou/skiff", shipSize16x16), 			adTodo,	adTodo ),
			new sd("Nitpiknik",		"Triunion",		5,		10,		40,		.5 / headings16, 	10, 10, 	.2,		10, 	1000, 	sv16("Nitpiknik", "zoqfotpik/stinger", shipSize16x16), 	adTodo,	adTodo ),
			new sd("Aegis",			"Raptor",		3,		2,		30,		.33 / headings16, 	20, 20, 	.29,	10, 	1000, 	sv16("Aegis", "yehat/terminator", shipSize16x16), 		adTodo,	adTodo ),
			new sd("Afterburner", 	"Warpig",		7,		7,		28,		.5 / headings16, 	8, 8, 		.142,	24, 	1000, 	sv16("Afterburner", "thraddash/torch", shipSize16x16), 	adTodo,	adTodo ),
			new sd("Indemnity", 	"Murch",		7,		1.2,	36,		.2 / headings16, 	20, 20, 	.2,		42, 	1000, 	sv16("Indemnity", "melnorme/trader", shipSize16x16),	adTodo,	adTodo ),
			new sd("MetamorphA", 	"Knsnynz",		3,		2.5,	20,		.33 / headings16, 	20, 20, 	.29,	10, 	1000, 	sv16("MetamorphA", "mmrnmhrm/xform", shipSize16x16), 	adTodo,	adTodo ),
			new sd("MetamorphB", 	"Knsnynz",		3,		10,		50,		.07 / headings16,  	20, 20, 	.14,	10, 	1000, 	sv16("MetamorphB", "mmrnmhrm/xform", shipSize16x16), 	adTodo,	adTodo ),
		];

		this._AllByName = ArrayHelper.addLookupsByName(this._All);
	}
}
