function debug(universe)
{
	universe.mediaLibrary.waitForItemsAllToLoad(debug_MediaLoaded.bind(null, universe));
}

function debug_MediaLoaded(universe)
{
	var world = World.new(universe);
	universe.world = world;
	universe.venueNext = new VenueWorld(world);

	var debuggingMode = universe.debuggingMode;

	if (debuggingMode == "Combat")
	{
		combat(universe);
	}
	else if (debuggingMode == "Docks")
	{
		docks(universe);
	}
	else if (debuggingMode == "Hyperspace")
	{
		hyperspace(universe);
	}
	else if (debuggingMode == "HyperspaceMap")
	{
		hyperspaceMap(universe);
	}
	else if (debuggingMode == "Planet")
	{
		planet(universe);
	}
	else if (debuggingMode == "PlanetEnergy")
	{
		planetEnergy(universe);
	}
	else if (debuggingMode == "Start")
	{
		start(universe);
	}
}

function combat(universe)
{
	var displaySize = universe.display.sizeInPixels;
	var combatSize = new Coords(1, 1).multiplyScalar(displaySize.y * 2);
	var encounter = null; // todo
	var shipDefnsAll = ShipDefn.Instances(universe);
	/*
	var playerShipDefns =
	[
		shipDefnsAll["Fireblossom"],
		shipDefnsAll["Efflorescence"],
		shipDefnsAll["Scuttler"],
	];
	*/
	var playerShipDefns = shipDefnsAll;
	var enemyShipDefns =
	[
		shipDefnsAll["Kickback"],
		shipDefnsAll["Starshard"],
		shipDefnsAll["Sporsac"],
	];
	var playerShips = Ship.manyFromDefns(playerShipDefns);
	var enemyShips = Ship.manyFromDefns(enemyShipDefns);

	var combat = new Combat
	(
		combatSize,
		encounter,
		// shipGroups
		[
			new ShipGroup
			(
				"Player",
				null, // factionName
				null, // pos
				playerShips
			),
			new ShipGroup
			(
				"Other",
				null, // factionName
				null, // pos
				enemyShips
			)
		]
	).initialize(universe.world);
	var controlShipSelect = combat.toControlShipSelect
	(
		universe, displaySize
	);
	var venueNext = new VenueControls(controlShipSelect);
	universe.venueNext = venueNext;
}

function docks(universe)
{
	var world = universe.world;
	world.defns.factions["Terran"].relationsWithPlayer = Faction.RelationsAllied;
	var player = world.player;
	player.credit = 1000;
	var resourceDefns = ResourceDefn.Instances();
	var playerItemHolder = player.flagship.itemHolder;
	playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));
	playerItemHolder.itemAdd(new Item(resourceDefns.Exotics.name, 100));

	var starsystemSol = world.hyperspace.starsystems["Sol"];
	var station = starsystemSol.planets[2].satellites[0];
	var placePlanetVicinity = null;
	var placeStation = new PlaceStation(world, station, placePlanetVicinity);
	var placeStationDocks = new PlaceStationDock(world, placeStation);
	world.place = placeStationDocks;
}

function hyperspace(universe)
{
	var world = universe.world;
	var hyperspace = world.hyperspace
	var starsystemSol = hyperspace.starsystems["Sol"];
	var playerPos = starsystemSol.posInHyperspace.clone();
	var playerLoc = new Location(playerPos);
	var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
	world.place = placeHyperspace;
}

function hyperspaceMap(universe)
{
	var world = universe.world;
	var hyperspace = world.hyperspace
	var starsystemSol = hyperspace.starsystems["Sol"];
	var playerPos = starsystemSol.posInHyperspace.clone();
	var playerLoc = new Location(playerPos);
	var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
	placeHyperspace.updateForTimerTick(universe, world);
	var placeMap = new PlaceHyperspaceMap(placeHyperspace);
	world.place = placeMap;
}

function planet(universe)
{
	var world = universe.world;
	var starsystem = world.hyperspace.starsystems[1]; // Eta Giclas
	var planet = starsystem.planets[4]; // E Giclas V
	var placePlanetVicinity = null;
	var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
	world.place = placePlanetOrbit;
}

function planetEnergy(universe)
{
	var world = universe.world;
	var starsystem = world.hyperspace.starsystems["Sol"];
	var planet = starsystem.planets[8]; // Pluto
	var placePlanetVicinity = null;
	var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
	world.place = placePlanetOrbit;
}

function start(universe)
{
	var world = universe.world;
	var starsystemSol = world.hyperspace.starsystems["Sol"];
	var starsystemSize = starsystemSol.sizeInner;
	var playerPos = new Coords(.5, .95).multiply(starsystemSize);
	var playerLoc = new Location
	(
		playerPos,
		new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1))
	);
	var place = new PlaceStarsystem(world, starsystemSol, playerLoc);
	world.place = place;
}
