function World(name, dateCreated, defns, player, hyperspace, starsystemStart)
{
	this.name = name;
	this.dateCreated = dateCreated;

	this.timerTicksSoFar = 0;

	this.defns = defns;

	this.player = player;
	this.hyperspace = hyperspace;

	this.place = new PlaceStarsystem
	(
		this,
		starsystemStart,
		new Location
		(
			new Coords(.5, .95).multiply(starsystemStart.sizeInner),
			new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1))
		)
	);
	//this.place.entitiesSpawn(null, this);
}

{
	// static methods

	World.new = function(universe)
	{
		var now = DateTime.now();
		var nowAsString = now.toStringMMDD_HHMM_SS();

		var constraintDefnsAll = ConstraintDefn.Instances();
		var constraintDefns =
		[
			constraintDefnsAll.Friction,
			constraintDefnsAll.FrictionDry,
			constraintDefnsAll.SpeedMax,
			constraintDefnsAll.StopBelowSpeedMin,
			constraintDefnsAll.TrimToRange,
			constraintDefnsAll.WrapToRange,
			constraintDefnsAll.WrapXTrimY
		];

		// todo
		var actions = Ship.actions();
		var actionToInputsMappings = Ship.actionToInputsMappings();

		var placeDefns = 
		[
			new PlaceDefn(PlaceCombat.name, actions, actionToInputsMappings),
			new PlaceDefn(PlaceEncounter.name, actions, actionToInputsMappings),
			new PlaceDefn(PlaceHyperspace.name, actions, actionToInputsMappings),
			new PlaceDefn(PlacePlanetOrbit.name, actions, actionToInputsMappings),
			new PlaceDefn(PlacePlanetSurface.name, actions, actionToInputsMappings),
			new PlaceDefn(PlacePlanetVicinity.name, actions, actionToInputsMappings),
			new PlaceDefn(PlaceStarsystem.name, actions, actionToInputsMappings),
		];

		var hyperspaceSize = new Coords(1, 1).multiplyScalar(10000);

		var shipGroupActivityApproach = function(universe, world, place, entityActor)
		{
			var actor = entityActor.actor;

			var targetPos = actor.targetPos;
			if (targetPos == null)
			{
				var entityToTargetName = "Player";
				var target = place.entities[entityToTargetName];
				targetPos = target.Locatable.loc.pos;
				actor.targetPos = targetPos;
			}

			var actorLoc = entityActor.Locatable.loc;
			var actorPos = actorLoc.pos;
			var actorVel = actorLoc.vel;

			actorVel.overwriteWith
			(
				targetPos
			).subtract
			(
				actorPos
			);

			if (actorVel.magnitude() < 1)
			{
				actorPos.overwriteWith(targetPos);
				//place.entitiesToRemove.push(entityActor);
				entityActor.killable.die(universe, world, place, entityActor);
			}
			else
			{
				actorVel.normalize();
			}
		}

		// special

		var factionTerran = new Faction
		(
			"Terran",
			null, // nameOriginal
			null, // color
			Faction.RelationsAllied, // todo
			true, // talksImmediately
			"EarthStation", // conversationDefnName
			null, // sphereOfInfluence
			"Broadsider", // shipDefnName
			null // shipGroupActivity
		);

		var factionLahkemupGuardDrone = new Faction
		(
			"LahkemupGuardDrone",
			null, // nameOriginal
			null, // color
			Faction.RelationsHostile,
			true, // talksImmediately
			"LahkemupGuardDrone", // conversationDefnName
			null, // sphereOfInfluence
			null, // shipDefnName
			shipGroupActivityApproach
		);

		// normal

		var f = function(name, nameOriginal, color, sphereOfInfluence, relations, shipDefnName)
		{
			var talksImmediately = (sphereOfInfluence == null);

			return new Faction
			(
				name,
				nameOriginal,
				color,
				relations,
				talksImmediately,
				name, // conversationDefnName
				sphereOfInfluence,
				shipDefnName,
				shipGroupActivityApproach
			);
		}

		var soi = function(centerX, centerY, radius)
		{
			return new Sphere
			(
				new Coords(centerX, 1000 - centerY).multiplyScalar(10),
				radius * hyperspaceSize.x
			);
		}

		var hostile = Faction.RelationsHostile;
		var neutral = Faction.RelationsNeutral;

		var factionAmorfus 		= f("Amorfus", 		"Umgah", 	"Violet", 	soi(197.8, 596.8, .1), 	hostile, "Pustule");
		var factionAraknoid 	= f("Araknoid", 	"Ilwrath", 	"Purple", 	soi(22.9, 366.6, .15), 	hostile, "Infernus");
		var factionDaskapital 	= f("Daskapital", 	"Druuge", 	"Red", 		soi(946.9, 280.6, .1), 	neutral, "Kickback");
		var factionEllfyn		= f("Ellfyn", 		"Arilou", 	"Blue", 	soi(100, 500, .05), 	neutral, "Discus");
		var factionHyphae 		= f("Hyphae", 		"Mycon", 	"Purple", 	soi(629.1, 220.8, .12), hostile, "Sporsac");
		var factionKehlemal 	= f("Kehlemal", 	"Kohrah", 	"Gray", 	soi(610, 610, .25), 	hostile, "Silencer");
		var factionLahkemup 	= f("Lahkemup",		"Urquan", 	"Green",	soi(590, 590, .25), 	hostile, "Shackler");
		var factionSilikonix 	= f("Konstalyxz", 	"Chmmr", 	null, 		null, 					neutral, "Gravitar");
		var factionMauluska 	= f("Mauluska", 	"Spathi", 	"Brown", 	soi(241.6, 368.7, .12), neutral, "Scuttler");
		var factionMoroz 		= f("Moroz", 		"Utwig", 	"Cyan", 	soi(863.0, 869.3, .1), 	neutral, "Punishponj");
		var factionMuuncaf 		= f("Muuncaf", 		"Pkunk", 	"Cyan", 	soi(52.2, 52.5, .1), 	neutral, "Fireblossom");
		var factionMazonae		= f("Mazonae", 		"Syreen", 	null, 		null, 					neutral, "Elysian");
		var factionMurch 		= f("Murch", 		"Melnorme", null, 		null, 					neutral, "Indemnity");
		var factionOutsider 	= f("Outsider", 	"Orz", 		"Purple", 	soi(371.3, 253.7, .1), 	neutral, "Wingshadow");
		var factionRaptor 		= f("Raptor", 		"Yehat", 	"Violet", 	soi(492.3, 029.4, .1), 	neutral, "Aegis");
		var factionRaptorRebel 	= f("RaptorRebel", 	"Yehat", 	"Mauve", 	soi(492.3, 029.4, .1), 	neutral, "Aegis");
		var factionRaptorRoyalist= f("RaptorRoyalist","Yehat", 	"Violet", 	soi(492.3, 029.4, .1), 	neutral, "Aegis");
		var factionSupial		= f("Supial", 		"Shofixti",	null,		null, 					hostile, "Starbright");
		var factionTempestrial 	= f("Tempestrial", 	"Slylandro",null, 		soi(500, 500, 1000), 	hostile, "Tumbler");
		var factionTriunion		= f("Triunion", 	"Zoqfotpik","Red", 		soi(400, 543.7, .067), 	neutral, "Nitpiknik");
		var factionTwyggan 		= f("Twyggan", 		"Supox", 	"Brown", 	soi(741.4, 912.4, .1), 	neutral, "Efflorescence");
		var factionUgglegruj 	= f("Ugglegruj", 	"VUX", 		"Blue", 	soi(433.3, 168.7, .12), hostile, "Encumbrator");
		var factionWarpig		= f("Warpig", 		"Thraddash","Cyan", 	soi(253.5, 835.8, .1), 	hostile, "Afterburner");

		var factions =
		[
			factionAmorfus,
			factionAraknoid,
			factionDaskapital,
			factionEllfyn,
			factionHyphae,
			factionKehlemal,
			factionLahkemup,
			factionLahkemupGuardDrone,
			factionMauluska,
			factionMoroz,
			factionMuuncaf,
			factionMazonae,
			factionMurch,
			factionOutsider,
			factionRaptor,
			factionSilikonix,
			factionSupial,
			factionTempestrial,
			factionTerran,
			factionTriunion,
			factionTwyggan,
			factionUgglegruj,
			factionWarpig,
		];

		var shipDefns = ShipDefn.Instances(universe);

		var lifeformDefns = LifeformDefn.Instances();

		var defns = new Defns(constraintDefns, placeDefns, factions, shipDefns, lifeformDefns);

		var mediaLibrary = universe.mediaLibrary;

		var starsAndPlanetsAsStringCSVCompressed =
			mediaLibrary.textStringGetByName("StarsAndPlanets").value;

		var hyperspace = Hyperspace.fromFileContentsAsString
		(
			hyperspaceSize,
			10, // starsystemRadiusOuter
			new Coords(300, 300),
			factions,
			starsAndPlanetsAsStringCSVCompressed
		);

		var starsystems = hyperspace.starsystems;
		var starsystemStart = starsystems["Sol"];
		starsystemStart.solarSystem(); // todo

		var playerShipDefnName = "Flagship";
		var playerShip = new Ship(playerShipDefnName);
		var shipDefns = ShipDefn.Instances(universe);
		var playerShips =
		[
			playerShip,
			new Ship("Broadsider")
		];
		var playerShipGroup = new ShipGroup
		(
			"Player",
			"Player", // factionName
			starsystemStart.posInHyperspace.clone(), // pos
			playerShips
		);
		var shipComponentDefns = ShipComponentDefn.Instances();

		var playerFlagship = new Flagship
		(
			playerShipDefnName,
			12, // componentsMax
			10, // thrustersMax
			10, // turningJetsMax
			[
				shipComponentDefns.FusionThruster.name,
				shipComponentDefns.CargoHold.name,
				shipComponentDefns.CrewHabitat.name,
				shipComponentDefns.FuelTank.name,
				shipComponentDefns.TurningJets.name,
			], // componentNames
			1, // numberOfLanders
			50, // crew
			100, // fuel
			[], // items
			30 // shipsMax
		);

		//var factionNamesAll = factions.elementProperties("name");

		var player = new Player
		(
			"Player",
			0, // credit
			playerFlagship,
			[
				"Terran"
			], // factionsKnownNames
			playerShipGroup
		);

		var returnValue = new World
		(
			"World-" + nowAsString,
			now, // dateCreated
			defns,
			player,
			hyperspace,
			starsystemStart
		);
		return returnValue;
	}

	// instance methods

	World.prototype.draw = function(universe)
	{
		this.place.draw(universe, this);
	}

	World.prototype.initialize = function(universe)
	{
		this.place.initialize(universe, this);
	}

	World.prototype.updateForTimerTick = function(universe)
	{
		if (this.placeNext != null)
		{
			this.place.finalize(universe, this);
			this.place = this.placeNext;
			this.place.initialize(universe, this);
			this.placeNext = null;
		}

		this.place.updateForTimerTick(universe, this);
		this.timerTicksSoFar++;
	}
}
