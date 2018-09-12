
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
	this.name = name;
	this.factionName = factionName;
	this.mass = mass;
	this.acceleration = acceleration;
	this.speedMax = speedMax;
	this.turnsPerTick = turnsPerTick;
	this.integrityMax = integrityMax;
	this.energyPerTick = energyPerTick;	
	this.energyMax = energyMax;
	this.visual = visual;
}
{
	// static methods

	ShipDefn.Instances = function()
	{
		if (ShipDefn._instances == null)
		{
			var visualShipTodo = new VisualNone(); // todo
		
			var shipDefnDefault = new ShipDefn
			(
				"Default",
				"Player", // factionName
				1, // mass
				.1, // accel
				2, // speedMax
				.01, // turnsPerTick
				10, // integrityMax
				0, // energyPerTick
				0, // energyMax
				visualShipTodo
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
				visualShipTodo // todo
			);

			var sd = ShipDefn;
									
			var heads = 16;

			ShipDefn._instances =
			[
				shipDefnDefault,

				//		name, 		factionName, 	mass, 	accel, 	speedMax,turnsPT, 	 crew, 	ept, 	eMax, 	visual
				new sd("Gravitar", 	"Silikonix", 	10, 	1.166, 	35, 	.25 / heads, 42, 	.5,  	42, 	visualShipTodo ),
				new sd("Infernus", 	"Araknoid", 	17,		5, 		25, 	.33 / heads, 22, 	.8,  	16, 	visualShipTodo ),
				new sd("Efflorescence", "Twygg", 	4, 		8, 		40, 	.5 / heads,  12, 	.2,  	16, 	visualShipTodo ),
				new sd("Starshard", "Xtalik", 		10,		.6, 	27, 	.142 / heads,36, 	.2,  	30, 	visualShipTodo ),
				new sd("Broadsider", "Terran", 		6,		.6, 	24, 	.5 / heads,	 18, 	.111,  	18, 	visualShipTodo ),
				new sd("Carrier", 	"Slaver", 		10,		.86, 	30, 	.2 / heads,	 42, 	.14,  	42, 	visualShipTodo ),
				new sd("Pustule", 	"Amorfus", 		1,		1.5, 	18, 	.2 / heads,	 10, 	.2,  	30, 	visualShipTodo ),
				new sd("Scuttler", 	"Mauluska", 	7,		6, 		48, 	.5 / heads,	 30, 	.091,  	10, 	visualShipTodo ),
				new sd("Fireblossom","Muuncaf",		1,		16,		64,		1 / heads,	 8,		0,		12, 	visualShipTodo ),
				new sd("Collapsar",	"Manalogous",	6,		3,		24,		.2 / heads,	 20,	.111,	24, 	visualShipTodo ),
				new sd("Encumbrance","Ugglegruj",	6,		1.4,	21,		.142 / heads, 20,	.111,	40, 	visualShipTodo ),
				new sd("Bulletsponge","Moroz",		8,		.86,	36,		.5 / heads,  20,	0,		20, 	visualShipTodo ),
				new sd("Silencer",	"Xenofobi",		10,		1.2,	30,		.2 / heads,  42,	.2,		42, 	visualShipTodo ),
				new sd("Kickback",	"Daskapital",	5,		1,		20,		.2 / heads,  14,	.02,	32, 	visualShipTodo ),
				new sd("Batwing",	"Outsider",		4,		5,		35,		.5 / heads,  16,	.142,	20, 	visualShipTodo ),
				new sd("Eylsian",	"Mazonae",		2,		4.5,	36,		.5 / heads,  42,	.142,	16, 	visualShipTodo ),
				new sd("Sporsac",	"Hyphae",		7,		1.29,	27,		.14 / heads, 20,	.2,		40, 	visualShipTodo ),
				new sd("Tumbler",	"Tempestrial",	1,		60,		60,		.5 / heads,  12,	0,		20, 	visualShipTodo ),
				new sd("Starbright","Supial",		1,		5,		35,		.5 / heads,  6,		.1,		4, 		visualShipTodo ),
				new sd("Discus",	"Ellfyn",		1,		40,		40,		.5 / heads,  6,		.142,	20, 	visualShipTodo ),
				new sd("Bugbite",	"Triunion",		5,		10,		40,		.5 / heads,  10,	.2,		10, 	visualShipTodo ),
				new sd("Aegis",		"Raptor",		3,		2,		30,		.33 / heads, 20,	.29,	10, 	visualShipTodo ),
				new sd("Aegis",		"Raptor",		3,		2,		30,		.33 / heads, 20,	.29,	10, 	visualShipTodo ),
				new sd("Afterburner","Warpig",		7,		7,		28,		.5 / heads,  8,		.142,	24, 	visualShipTodo ),				
				new sd("Indemnity", "Merch",		7,		1.2,	36,		.2 / heads,  20,	.2,		42, 	visualShipTodo ),
				new sd("MetamorphA", "Consonance",	3,		2.5,	20,		.33 / heads,  20,	.29,	10, 	visualShipTodo ),
				new sd("MetamorphB", "Consonance",	3,		10,		50,		.07 / heads,  20,	.14,	10, 	visualShipTodo ),
			];
		}

		return ShipDefn._instances;
	}

	// instance methods

	ShipDefn.prototype.faction = function(world)
	{
		// todo
	}
}
