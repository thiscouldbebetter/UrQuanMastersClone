
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
	attackDefnStandard
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
	this.attackDefnStandard = attackDefnStandard;

	this.cost = 100; // todo
}
{
	// static methods

	ShipDefn.Instances = function()
	{
		if (ShipDefn._instances == null)
		{
			ShipDefn._instances = new ShipDefn_Instances;
		}

		return ShipDefn._instances;
	}

	function ShipDefn_Instances()
	{
		var shipDimension = 10;

		var sv = function(colorMain, colorAccent)
		{
			return Ship.visual(shipDimension, colorMain, colorAccent);
		}

		var attackDefnTodo = new ShipAttackDefn
		(
			"todo",
			4, // energyToUse
			0, // heading
			8, // speed
			128, // range
			1, // damage
			new VisualCircle(3, "Yellow"), // visualProjectile
			new VisualCircle(6, "Yellow", "Red"), // visualImpact
			function effectWhenInvoked() {},
			function effectOnImpact() {},
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
			Ship.visual(shipDimension, "Gray", "Black"),
			attackDefnTodo
		);

		var shipDefnLander = new ShipDefn
		(
			"Lander",
			"Player", // factionName
			1, // mass
			1, // accel
			24, // speedMax
			.01, // turnsPerTick
			12, // crewInitial
			12, // crewMax
			0, // energyPerTick
			0, // energyMax
			Ship.visual(shipDimension, "Gray", "Black"),
			attackDefnTodo
		);

		var slaverGuardDrone = new ShipDefn
		(
			"SlaverGuardDrone",
			"Slavers", // factionName
			.1, // accel
			2, // speedMax
			.01, // turnsPerTick
			1, // crewInitial
			1, // crewMax
			0, // energyPerTick
			0, // energyMax
			Ship.visual(shipDimension, "DarkGreen", "Red"),
			attackDefnTodo
		);

		var sd = ShipDefn;

		var r = "Red";
		var o = "Orange";
		var y = "Yellow";
		var g = "Green";
		var b = "Blue";
		var v = "Violet";
		var w = "White";
		var a = "Gray";
		var ad = "DarkGray";
		var al = "LightGray";
		var c = "Cyan";
		var n = "Brown";
		var adTodo = attackDefnTodo;

		var heads = 16;

		this._All =
		[
			shipDefnFlagship,
			shipDefnLander,

			//		name, 		factionName, 	mass, 	accel, 	speedMax,turnsPT, 	 crew, 		e/tick,	eMax, 	visual,		attackDefn
			new sd("Gravitar", 	"Silikonix", 	10, 	1.166, 	35, 	.25 / heads, 42, 42,	.5,  	42, 	sv(b, r ), 	adTodo ),
			new sd("Infernus", 	"Araknoid", 	17,		5, 		25, 	.33 / heads, 22, 22, 	.8,  	16, 	sv(v, y ), 	adTodo ),
			new sd("Efflorescence", "Twygg", 	4, 		8, 		40, 	.5 / heads,  12, 12, 	.2,  	16, 	sv(g, o ), 	adTodo ),
			new sd("Starshard", "Xtalik", 		10,		.6, 	27, 	.142 / heads,36, 36, 	.2,  	30, 	sv(w, c), 	adTodo ),
			new sd("Broadsider", "Terran", 		6,		.6, 	24, 	.5 / heads,	 18, 18, 	.111,  	18, 	sv(a, ad),	adTodo ),
			new sd("Carrier", 	"Slaver", 		10,		.86, 	30, 	.2 / heads,	 42, 42, 	.14,  	42, 	sv(g, r),	adTodo ),
			new sd("Pustule", 	"Amorfus", 		1,		1.5, 	18, 	.2 / heads,	 10, 10, 	.2,  	30, 	sv(g, y), 	adTodo ),
			new sd("Scuttler", 	"Mauluska", 	7,		6, 		48, 	.5 / heads,	 30, 30, 	.091,  	10, 	sv(r, b), 	adTodo ),
			new sd("Fireblossom","Muuncaf",		1,		16,		64,		1 / heads,	 8, 8,		0,		12, 	sv(c, v), 	adTodo ),
			new sd("Collapsar",	"Manalogous",	6,		3,		24,		.2 / heads,	 20, 20,	.111,	24, 	sv(b, v), 	adTodo ),
			new sd("Encumbrance","Ugglegruj",	6,		1.4,	21,		.142 / heads, 20, 20,	.111,	40, 	sv(v, g), 	adTodo ),
			new sd("Bulletsponge","Moroz",		8,		.86,	36,		.5 / heads,  20, 20,	0,		20, 	sv(r, a), 	adTodo ),
			new sd("Silencer",	"Xenofobi",		10,		1.2,	30,		.2 / heads,  42, 42,	.2,		42, 	sv(ad, r), 	adTodo ),
			new sd("Kickback",	"Daskapital",	5,		1,		20,		.2 / heads,  14, 14,	.02,	32, 	sv(w, r), 	adTodo ),
			new sd("Batwing",	"Outsider",		4,		5,		35,		.5 / heads,  16, 16,	.142,	20, 	sv(c, r), 	adTodo ),
			new sd("Eylsian",	"Mazonae",		2,		4.5,	36,		.5 / heads,  12, 42,	.142,	16, 	sv(r, y), 	adTodo ),
			new sd("Sporsac",	"Hyphae",		7,		1.29,	27,		.14 / heads, 20, 20,	.2,		40, 	sv(n, v), 	adTodo ),
			new sd("Tumbler",	"Tempestrial",	1,		60,		60,		.5 / heads,  12, 12,	0,		20, 	sv(r, b), 	adTodo ),
			new sd("Sunbright",	"Supial",		1,		5,		35,		.5 / heads,  6, 6,		.1,		4, 		sv(a, b), 	adTodo ),
			new sd("Discus",	"Ellfyn",		1,		40,		40,		.5 / heads,  6, 6,		.142,	20, 	sv(c, y), 	adTodo ),
			new sd("Bugbite",	"Triunion",		5,		10,		40,		.5 / heads,  10, 10,	.2,		10, 	sv(c, b), 	adTodo ),
			new sd("Aegis",		"Raptor",		3,		2,		30,		.33 / heads, 20, 20,	.29,	10, 	sv(b, y), 	adTodo ),
			new sd("Afterburner","Warpig",		7,		7,		28,		.5 / heads,  8, 8,		.142,	24, 	sv(a, r), 	adTodo ),
			new sd("Indemnity", "Murch",		7,		1.2,	36,		.2 / heads,  20, 20,	.2,		42, 	sv(a, al), 	adTodo ),
			new sd("MetamorphA", "Consonance",	3,		2.5,	20,		.33 / heads,  20, 20,	.29,	10, 	sv(a, y), 	adTodo ),
			new sd("MetamorphB", "Consonance",	3,		10,		50,		.07 / heads,  20, 20,	.14,	10, 	sv(a, y), 	adTodo ),
		];

		return this._All.addLookups("name");
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
