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
	else if (debuggingMode == "Planet")
	{
		planet(universe);
	}
}

function combat(universe)
{
	var displaySize = universe.display.sizeInPixels;
	var combatSize = new Coords(1, 1).multiplyScalar(displaySize.y * 2);
	var encounter = null; // todo
	var shipDefnsAll = ShipDefn.Instances();
	var playerShips = Ship.manyFromDefns(shipDefnsAll);
	var enemyShips = Ship.manyFromDefns(shipDefnsAll);

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
				playerShips
			),
			new ShipGroup
			(
				"Other",
				null, // factionName
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
	player.itemHolder.itemAdd(new Item("Radioactives", 1));
	player.itemHolder.itemAdd(new Item("ExoticMaterials", 100));

	var starsystemSol = world.hyperspace.starsystems["Sol"];
	var station = starsystemSol.planets[2].satellites[0];
	var placePlanetVicinity = null;
	var placeStation = new PlaceStation(world, station, placePlanetVicinity);
	var placeStationDocks = new PlaceStationDock(world, placeStation);
	world.place = placeStationDocks;
}

function planet(universe)
{
	var world = universe.world;
	var starsystemSol = world.hyperspace.starsystems["Sol"];
	var planetMercury = starsystemSol.planets[0];
	var placePlanetVicinity = null;
	var placePlanetOrbit = new PlacePlanetOrbit(world, planetMercury, placePlanetVicinity);
	world.place = placePlanetOrbit;
}
