
function ShipDefn
(
	name,
	factionName,
	mass,
	acceleration,
	speedMax,
	turnsPerTick,
	crewInitial,
	crewMax,
	energyPerTick,
	energyMax,
	visual,
	attackDefn,
	specialDefn
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
	this.visual = visual;
	this.attackDefn = attackDefn;
	this.specialDefn = specialDefn;

	this.cost = 100; // todo
}
{
	// instances

	ShipDefn.Instances = function(universe)
	{
		if (ShipDefn._instances == null)
		{
			ShipDefn._instances = new ShipDefn_Instances(universe);
		}

		return ShipDefn._instances;
	}

	function ShipDefn_Instances(universe)
	{
		var shipDimension = 10;
		var shipSize = new Coords(1, 1).multiplyScalar(shipDimension * 2);

		var attackDefnTodo = new ShipAttackDefn
		(
			"todo",
			4, // energyToUse
			2, // projectileRadius
			8, // speed
			16, // ticksToLive
			20, // damage
			new VisualCircle(2, "Yellow"), // visualProjectile
			new VisualGroup
			([
				new VisualSound("Sound"),
				new VisualCircle(6, "Red")
			]), // visualImpact
			function effectWhenInvoked(universe, world, place, actor) {},
			function effectOnImpact(universe, world, place, actor, target) {},
		);

		var shipDefnFlagship = new ShipDefn
		(
			"Flagship",
			"Player", // factionName
			1, // mass
			.5, // accel
			24, // speedMax
			.005, // turnsPerTick
			10, // crewInitial
			10, // crewMax
			0, // energyPerTick
			0, // energyMax
			ShipDefn.visual(shipDimension, "Gray", "Black"),
			attackDefnTodo
		);

		var shipDefnLander = new ShipDefn
		(
			"Lander",
			"Player", // factionName
			1, // mass
			2, // accel
			48, // speedMax
			.01, // turnsPerTick
			12, // crewInitial
			12, // crewMax
			1, // energyPerTick
			4, // energyMax
			ShipDefn.visual(shipDimension, "Gray", "Black"),
			attackDefnTodo
		);

		var shipDefnLahkemupGuardDrone = new ShipDefn
		(
			"LahkemupGuardDrone",
			"Lahkemup", // factionName
			.1, // accel
			2, // speedMax
			.01, // turnsPerTick
			1, // crewInitial
			1, // crewMax
			0, // energyPerTick
			0, // energyMax
			ShipDefn.visual(shipDimension, "DarkGreen", "Red"),
			attackDefnTodo
		);

		var sd = ShipDefn;
		var spec = ShipSpecialDefn;

		var adTodo = attackDefnTodo;

		var heads = 16;

		var shipImagesDirectory = "../Content/Import/sc2/content/base/ships/";

		var sv = function(shipName, shipImageFilePrefix)
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
					+ ("" + imageIndex).padLeft(2, "0")
					+ ".png";

				var imageForHeading = new Image
				(
					imageName, imagePath
				);
				imagesForHeadings.push(imageForHeading);
				var visualForHeading = new VisualImage(imageName, shipSize);
				visualsForHeadings.push(visualForHeading);
			}
			universe.mediaLibrary.imagesAdd(imagesForHeadings);

			var shipVisual = new VisualDirectional
			(
				null, // no direction
				visualsForHeadings
			);

			return shipVisual;
		}

		// gravitar

		var shipGravitarSpecialTractorBeam = new ShipSpecialDefn
		(
			"TractorBeam",
			1, // energyToUse
			function effect(universe, world, place, actor)
			{
				var combat = place.combat;
				var ships = place.shipEntities();
				var target = ships[1 - ships.indexOf(actor)];
				var actorLoc = actor.locatable.loc;
				var actorPos = actorLoc.pos;
				var targetLoc = target.locatable.loc;
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
			function effect(universe, world, place, actor)
			{
				var isCloaked = actor.ship.isCloaked;
				isCloaked = (isCloaked == null ? false : isCloaked);
				actor.ship.isCloaked = (isCloaked == false);
			}
		);

		// infernus

		var shipInfernusVisualBase = sv("Infernus", "ilwrath/avenger");
		var shipInfernusVisualCloaked = ShipDefn.visual(shipDimension, "Black", "Black");
		var shipInfernusVisual = new VisualDynamic
		(
			function(universe, world, drawable, entity)
			{
				var isCloaked = entity.ship.isCloaked;
				return (isCloaked == true ? shipInfernusVisualCloaked : shipInfernusVisualBase);
			}
		);

		// starshard

		var shipStarshardSpecialLeech = new ShipSpecialDefn
		(
			"Leech",
			1, // energyToUse
			function effect(universe, world, place, actor)
			{
				// todo
			}
		);

		this._All =
		[
			shipDefnFlagship,
			shipDefnLander,
			shipDefnLahkemupGuardDrone,

			//		name, 		factionName, 	mass, 	accel, 	speedMax,turnsPT, 	 crew, 		e/tick,	eMax, 	visual,								attack, special
			new sd("Gravitar", 	"Konstalyxz", 	10, 	1.166, 	35, 	.25 / heads, 42, 42,	.5,  	42, 	sv("Gravitar", "chmmr/avatar"), 	adTodo, shipGravitarSpecialTractorBeam ),
			new sd("Infernus", 	"Araknoid", 	17,		5, 		25, 	.33 / heads, 22, 22, 	.8,  	16, 	shipInfernusVisual, 				adTodo,	shipInfernusSpecialCloak ),
			new sd("Efflorescence", "Twyggan", 	4, 		8, 		40, 	.5 / heads,  12, 12, 	.2,  	16, 	sv("Efflorescence", "supox/blade"), adTodo,	adTodo ),
			new sd("Starshard", "Xtalix", 		10,		.6, 	27, 	.142 / heads,36, 36, 	.2,  	30, 	sv("Starshard", "chenjesu/broodhome"), adTodo,	shipStarshardSpecialLeech ),
			new sd("Broadsider", "Terran", 		6,		.6, 	24, 	.5 / heads,	 18, 18, 	.111,  	18, 	sv("Broadsider", "human/cruiser"),	adTodo,	adTodo ),
			new sd("Shackler", 	"Lahkemup", 	10,		.86, 	30, 	.2 / heads,	 42, 42, 	.14,  	42, 	sv("Shackler", "urquan/dreadnought"),adTodo,	adTodo ),
			new sd("Pustule", 	"Amorfus", 		1,		1.5, 	18, 	.2 / heads,	 10, 10, 	.2,  	30, 	sv("Pustule", "umgah/drone"), 		adTodo,	adTodo ),
			new sd("Scuttler", 	"Mauluska", 	7,		6, 		48, 	.5 / heads,	 30, 30, 	.091,  	10, 	sv("Scuttler", "spathi/eluder"), 	adTodo,	adTodo ),
			new sd("Fireblossom","Muuncaf",		1,		16,		64,		1 / heads,	 8, 8,		0,		12, 	sv("Fireblossom", "pkunk/fury"), 	adTodo,	adTodo ),
			new sd("Collapsar",	"Manalogous",	6,		3,		24,		.2 / heads,	 20, 20,	.111,	24, 	sv("Collapsar", "androsynth/guardian"),	adTodo,	adTodo ),
			new sd("Encumbrator","Ugglegruj",	6,		1.4,	21,		.142 / heads, 20, 20,	.111,	40, 	sv("Encumbrator", "vux/intruder"), 	adTodo,	adTodo ),
			new sd("Punishpunj","Moroz",		8,		.86,	36,		.5 / heads,  20, 20,	0,		20, 	sv("Punishponge", "utwig/jugger"), 	adTodo,	adTodo ),
			new sd("Silencer",	"Kehlemal",		10,		1.2,	30,		.2 / heads,  42, 42,	.2,		42, 	sv("Silencer", "kohrah/marauder"), 	adTodo,	adTodo ),
			new sd("Kickback",	"Daskapital",	5,		1,		20,		.2 / heads,  14, 14,	.02,	32, 	sv("Kickback", "druuge/mauler"), 	adTodo,	adTodo ),
			new sd("Wingshadow","Outsider",		4,		5,		35,		.5 / heads,  16, 16,	.142,	20, 	sv("Wingshadow", "orz/nemesis"), 	adTodo,	adTodo ),
			new sd("Elysian",	"Mazonae",		2,		4.5,	36,		.5 / heads,  12, 42,	.142,	16, 	sv("Elysian", "syreen/penetrator"),	adTodo,	adTodo ),
			new sd("Sporsac",	"Hyphae",		7,		1.29,	27,		.14 / heads, 20, 20,	.2,		40, 	sv("Sporsac", "mycon/podship"), 	adTodo,	adTodo ),
			new sd("Tumbler",	"Tempestrial",	1,		60,		60,		.5 / heads,  12, 12,	0,		20, 	sv("Tumbler", "slylandro/probe"),	adTodo,	adTodo ),
			new sd("Sunbright",	"Supial",		1,		5,		35,		.5 / heads,  6, 6,		.1,		4, 		sv("Sunbright", "shofixti/scout"),	adTodo,	adTodo ),
			new sd("Discus",	"Ellfyn",		1,		40,		40,		.5 / heads,  6, 6,		.142,	20, 	sv("Discus", "arilou/skiff"), 		adTodo,	adTodo ),
			new sd("Nitpiknik",	"Triunion",		5,		10,		40,		.5 / heads,  10, 10,	.2,		10, 	sv("Nitpiknik", "zoqfotpik/stinger"), adTodo,	adTodo ),
			new sd("Aegis",		"Raptor",		3,		2,		30,		.33 / heads, 20, 20,	.29,	10, 	sv("Aegis", "yehat/terminator"), 	adTodo,	adTodo ),
			new sd("Afterburner","Warpig",		7,		7,		28,		.5 / heads,  8, 8,		.142,	24, 	sv("Afterburner", "thraddash/torch"), adTodo,	adTodo ),
			new sd("Indemnity", "Murch",		7,		1.2,	36,		.2 / heads,  20, 20,	.2,		42, 	sv("Indemnity", "melnorme/trader"),	adTodo,	adTodo ),
			new sd("MetamorphA", "Knsnynz",		3,		2.5,	20,		.33 / heads,  20, 20,	.29,	10, 	sv("MetamorphA", "mmrnmhrm/xform"), adTodo,	adTodo ),
			new sd("MetamorphB", "Knsnynz",		3,		10,		50,		.07 / heads,  20, 20,	.14,	10, 	sv("MetamorphB", "mmrnmhrm/xform"), adTodo,	adTodo ),
		];

		return this._All.addLookups("name");
	}

	// static methods

	ShipDefn.visual = function(dimension, colorFill, colorBorder)
	{
		var visualPath = new Path
		([
			new Coords(1.2, 0).multiplyScalar(dimension).half(),
			new Coords(-.8, .8).multiplyScalar(dimension).half(),
			new Coords(-.8, -.8).multiplyScalar(dimension).half(),
		]);

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

		return returnValue;
	}

	// instance methods

	ShipDefn.prototype.faction = function(world)
	{
		// todo
	}

	ShipDefn.prototype.fullName = function()
	{
		return this.factionName + " " + this.name;
	}
}
