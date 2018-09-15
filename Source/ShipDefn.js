
function ShipDefn
(
	name,
	factionName,
	mass,
	acceleration,
	speedMax,
	turnsPerTick,
	integrityMax,
	energyPerTick,
	energyMax,
	visual
)
{
	var speedDivisor = 32; // Trial and error.

	this.name = name;
	this.factionName = factionName;
	this.mass = mass;
	this.acceleration = acceleration / speedDivisor;
	this.speedMax = speedMax / speedDivisor;
	this.turnsPerTick = turnsPerTick;
	this.integrityMax = integrityMax;
	this.energyPerTick = energyPerTick;
	this.energyMax = energyMax;
	this.visual = visual;

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

		var shipDefnFlagship = new ShipDefn
		(
			"Flagship",
			"Player", // factionName
			1, // mass
			.5, // accel
			24, // speedMax
			.005, // turnsPerTick
			10, // integrityMax
			0, // energyPerTick
			0, // energyMax
			Ship.visual(shipDimension, "Gray", "Black")
		);

		var shipDefnLander = new ShipDefn
		(
			"Lander",
			"Player", // factionName
			1, // mass
			1, // accel
			24, // speedMax
			.01, // turnsPerTick
			10, // integrityMax
			0, // energyPerTick
			0, // energyMax
			Ship.visual(shipDimension, "Gray", "Black")
		);

		var slaverGuardDrone = new ShipDefn
		(
			"SlaverGuardDrone",
			"Slavers", // factionName
			.1, // accel
			2, // speedMax
			.01, // turnsPerTick
			10, // integrityMax
			0, // energyPerTick
			0, // energyMax
			Ship.visual(shipDimension, "DarkGreen", "Red")
		);

		var sd = ShipDefn;

		var heads = 16;

		this._All =
		[
			shipDefnFlagship,
			shipDefnLander,

			//		name, 		factionName, 	mass, 	accel, 	speedMax,turnsPT, 	 crew, 	ept, 	eMax, 	visual
			new sd("Gravitar", 	"Silikonix", 	10, 	1.166, 	35, 	.25 / heads, 42, 	.5,  	42, 	sv("Blue", "Red" ) ),
			new sd("Infernus", 	"Araknoid", 	17,		5, 		25, 	.33 / heads, 22, 	.8,  	16, 	sv("Violet", "Yellow" ) ),
			new sd("Efflorescence", "Twygg", 	4, 		8, 		40, 	.5 / heads,  12, 	.2,  	16, 	sv("Green", "Orange" ) ),
			new sd("Starshard", "Xtalik", 		10,		.6, 	27, 	.142 / heads,36, 	.2,  	30, 	sv("White", "Cyan") ),
			new sd("Broadsider", "Terran", 		6,		.6, 	24, 	.5 / heads,	 18, 	.111,  	18, 	sv("Gray", "DarkGray") ),
			new sd("Carrier", 	"Slaver", 		10,		.86, 	30, 	.2 / heads,	 42, 	.14,  	42, 	sv("Green", "Red") ),
			new sd("Pustule", 	"Amorfus", 		1,		1.5, 	18, 	.2 / heads,	 10, 	.2,  	30, 	sv("Green", "Yellow") ),
			new sd("Scuttler", 	"Mauluska", 	7,		6, 		48, 	.5 / heads,	 30, 	.091,  	10, 	sv("Red", "Blue") ),
			new sd("Fireblossom","Muuncaf",		1,		16,		64,		1 / heads,	 8,		0,		12, 	sv("Cyan", "Violet") ),
			new sd("Collapsar",	"Manalogous",	6,		3,		24,		.2 / heads,	 20,	.111,	24, 	sv("Blue", "Violet") ),
			new sd("Encumbrance","Ugglegruj",	6,		1.4,	21,		.142 / heads, 20,	.111,	40, 	sv("Violet", "Green") ),
			new sd("Bulletsponge","Moroz",		8,		.86,	36,		.5 / heads,  20,	0,		20, 	sv("Red", "Gray") ),
			new sd("Silencer",	"Xenofobi",		10,		1.2,	30,		.2 / heads,  42,	.2,		42, 	sv("DarkGray", "Red") ),
			new sd("Kickback",	"Daskapital",	5,		1,		20,		.2 / heads,  14,	.02,	32, 	sv("White", "Red") ),
			new sd("Batwing",	"Outsider",		4,		5,		35,		.5 / heads,  16,	.142,	20, 	sv("Cyan", "Red") ),
			new sd("Eylsian",	"Mazonae",		2,		4.5,	36,		.5 / heads,  42,	.142,	16, 	sv("Red", "Yellow") ),
			new sd("Sporsac",	"Hyphae",		7,		1.29,	27,		.14 / heads, 20,	.2,		40, 	sv("Brown", "Violet") ),
			new sd("Tumbler",	"Tempestrial",	1,		60,		60,		.5 / heads,  12,	0,		20, 	sv("Red", "Blue") ),
			new sd("Starbright","Supial",		1,		5,		35,		.5 / heads,  6,		.1,		4, 		sv("Gray", "Blue") ),
			new sd("Discus",	"Ellfyn",		1,		40,		40,		.5 / heads,  6,		.142,	20, 	sv("Cyan", "Yellow") ),
			new sd("Bugbite",	"Triunion",		5,		10,		40,		.5 / heads,  10,	.2,		10, 	sv("Cyan", "Blue") ),
			new sd("Aegis",		"Raptor",		3,		2,		30,		.33 / heads, 20,	.29,	10, 	sv("Blue", "Yellow") ),
			new sd("Afterburner","Warpig",		7,		7,		28,		.5 / heads,  8,		.142,	24, 	sv("Gray", "Red") ),
			new sd("Indemnity", "Murch",		7,		1.2,	36,		.2 / heads,  20,	.2,		42, 	sv("Gray", "LightGray") ),
			new sd("MetamorphA", "Consonance",	3,		2.5,	20,		.33 / heads,  20,	.29,	10, 	sv("Gray", "Yellow") ),
			new sd("MetamorphB", "Consonance",	3,		10,		50,		.07 / heads,  20,	.14,	10, 	sv("Gray", "Yellow") ),
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
