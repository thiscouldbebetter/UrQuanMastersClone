
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

	static byName(name: string, universe: Universe): ShipDefn
	{
		return ShipDefn.Instances(universe)._AllByName.get(name);
	}

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
		var returnValue = new VisualPolygon(visualPath, colorFill, colorBorder);

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
		var shipSize = Coords.fromXY(1, 1).multiplyScalar(shipDimension * 2);

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
			ShipDefn.visual(shipDimension, colorGray, colorBlack),
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
			ShipDefn.visual
			(
				shipDimension, Color.byName("GreenDark"), Color.byName("Red")
			),
			attackDefnTodo,
			null // ?
		);

		var adTodo = attackDefnTodo;

		var heads = 16;

		var shipImagesDirectory = "../Content/Import/sc2/content/base/ships/";
		var shipDimension = 16;
		var shipSize = Coords.fromXY(1, 1).multiplyScalar(shipDimension);

		var sv = (shipName: string, shipImageFilePrefix: string) =>
		{
			var imagesForHeadings = [];
			var visualsForHeadings = [];
			for (var i = 0; i < heads; i++)
			{
				var imageName = shipName + i;
				var imageIndex = (i + heads / 4) % heads;
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
				imagesForHeadings.push(imageForHeading);
				var visualForHeading: VisualImage =
					new VisualImageFromLibrary(imageName);//, shipSize);
				visualForHeading =
					new VisualImageScaled(visualForHeading, shipSize);
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
			new VisualCircle(3, Color.byName("GreenDark"), Color.byName("Green"), null), // visualProjectile
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

		var shipInfernusVisualBase = sv("Infernus", "ilwrath/avenger");
		var shipInfernusVisualCloaked = ShipDefn.visual(shipDimension, colorBlack, colorBlack);
		var shipInfernusVisual = new VisualDynamic
		(
			(universe: Universe, world: World, place: Place, actor: Entity) =>
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
				var targetEntityName = actor.actor().activity.target() as string;
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
				var targetEntityName = actor.actor().activity.target() as string;
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

			//		name, 		factionName, 	mass, 	accel, 	speedMax,turnsPT, 	 crew, 		e/tick,	eMax, 	value, 	visual,								attack, special
			new sd("Gravitar", 	"Konstalyxz", 	10, 	1.166, 	35, 	.25 / heads, 42, 42,	.5,  	42,		1000, 	sv("Gravitar", "chmmr/avatar"), 	adTodo, shipGravitarSpecialTractorBeam ),
			new sd("Infernus", 	"Araknoid", 	17,		5, 		25, 	.33 / heads, 22, 22, 	.8,  	16, 	1000, 	shipInfernusVisual, 				adTodo,	shipInfernusSpecialCloak ),
			new sd("Efflorescence", "Twyggan", 	4, 		8, 		40, 	.5 / heads,  12, 12, 	.2,  	16, 	1000, 	sv("Efflorescence", "supox/blade"), adTodo,	adTodo ),
			new sd("Starshard", "Xtalix", 		10,		.6, 	27, 	.142 / heads,36, 36, 	.2,  	30, 	1000, 	sv("Starshard", "chenjesu/broodhome"), adTodo,	shipStarshardSpecialLeech ),
			new sd("Broadsider", "Terran", 		6,		.6, 	24, 	.5 / heads,	 18, 18, 	.111,  	18, 	1000, 	sv("Broadsider", "human/cruiser"),	adTodo,	adTodo ),
			new sd("Shackler", 	"Lahkemup", 	10,		.86, 	30, 	.2 / heads,	 42, 42, 	.14,  	42, 	1000, 	sv("Shackler", "urquan/dreadnought"),adTodo, shipShacklerSpecialFighter ),
			new sd("Pustule", 	"Amorfus", 		1,		1.5, 	18, 	.2 / heads,	 10, 10, 	.2,  	30, 	1000, 	sv("Pustule", "umgah/drone"), 		adTodo,	shipPustuleSpecialRetrodrive ),
			new sd("Scuttler", 	"Mauluska", 	7,		6, 		48, 	.5 / heads,	 30, 30, 	.091,  	10, 	1000, 	sv("Scuttler", "spathi/eluder"), 	adTodo,	shipScuttlerSpecialMoonbeam ),
			new sd("Fireblossom","Muuncaf",		1,		16,		64,		1 / heads,	 8, 8,		0,		12, 	1000, 	sv("Fireblossom", "pkunk/fury"), 	adTodo,	shipFireblossomSpecialRefuel ),
			new sd("Collapsar",	"Manalogous",	6,		3,		24,		.2 / heads,	 20, 20,	.111,	24, 	1000, 	sv("Collapsar", "androsynth/guardian"),	adTodo,	adTodo ),
			new sd("Encumbrator","Ugglegruj",	6,		1.4,	21,		.142 / heads, 20, 20,	.111,	40, 	1000, 	sv("Encumbrator", "vux/intruder"), 	adTodo,	shipEncumbratorSpecialBurr ),
			new sd("Punishpunj","Moroz",		8,		.86,	36,		.5 / heads,  20, 20,	0,		20, 	1000, 	sv("Punishpunj", "utwig/jugger"), 	adTodo,	adTodo ),
			new sd("Silencer",	"Kehlemal",		10,		1.2,	30,		.2 / heads,  42, 42,	.2,		42, 	1000, 	sv("Silencer", "kohrah/marauder"), 	adTodo,	adTodo ),
			new sd("Kickback",	"Daskapital",	5,		1,		20,		.2 / heads,  14, 14,	.02,	32, 	1000, 	sv("Kickback", "druuge/mauler"), 	adTodo,	shipKickbackSpecialRightsize ),
			new sd("Wingshadow","Outsider",		4,		5,		35,		.5 / heads,  16, 16,	.142,	20, 	1000, 	sv("Wingshadow", "orz/nemesis"), 	adTodo,	adTodo ),
			new sd("Elysian",	"Mazonae",		2,		4.5,	36,		.5 / heads,  12, 42,	.142,	16, 	1000, 	sv("Elysian", "syreen/penetrator"),	adTodo,	shipElysianSpecialEnticer ),
			new sd("Sporsac",	"Hyphae",		7,		1.29,	27,		.14 / heads, 20, 20,	.2,		40, 	1000, 	sv("Sporsac", "mycon/podship"), 	adTodo,	shipSporsacSpecialRegenerate ),
			new sd("Tumbler",	"Tempestrial",	1,		60,		60,		.5 / heads,  12, 12,	0,		20, 	1000, 	sv("Tumbler", "slylandro/probe"),	adTodo,	shipTumblerSpecialCatabolize ),
			new sd("Sunbright",	"Supial",		1,		5,		35,		.5 / heads,  6, 6,		.1,		4, 		1000, 	sv("Sunbright", "shofixti/scout"),	adTodo,	shipSunbrightSpecialBigBadaBoom ),
			new sd("Discus",	"Ellfyn",		1,		40,		40,		.5 / heads,  6, 6,		.142,	20, 	1000, 	sv("Discus", "arilou/skiff"), 		adTodo,	adTodo ),
			new sd("Nitpiknik",	"Triunion",		5,		10,		40,		.5 / heads,  10, 10,	.2,		10, 	1000, 	sv("Nitpiknik", "zoqfotpik/stinger"), adTodo,	adTodo ),
			new sd("Aegis",		"Raptor",		3,		2,		30,		.33 / heads, 20, 20,	.29,	10, 	1000, 	sv("Aegis", "yehat/terminator"), 	adTodo,	adTodo ),
			new sd("Afterburner","Warpig",		7,		7,		28,		.5 / heads,  8, 8,		.142,	24, 	1000, 	sv("Afterburner", "thraddash/torch"), adTodo,	adTodo ),
			new sd("Indemnity", "Murch",		7,		1.2,	36,		.2 / heads,  20, 20,	.2,		42, 	1000, 	sv("Indemnity", "melnorme/trader"),	adTodo,	adTodo ),
			new sd("MetamorphA", "Knsnynz",		3,		2.5,	20,		.33 / heads,  20, 20,	.29,	10, 	1000, 	sv("MetamorphA", "mmrnmhrm/xform"), adTodo,	adTodo ),
			new sd("MetamorphB", "Knsnynz",		3,		10,		50,		.07 / heads,  20, 20,	.14,	10, 	1000, 	sv("MetamorphB", "mmrnmhrm/xform"), adTodo,	adTodo ),
		];

		this._AllByName = ArrayHelper.addLookupsByName(this._All);
	}
}
