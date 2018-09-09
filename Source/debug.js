function debug(universe)
{
	universe.mediaLibrary.waitForItemsAllToLoad
	(
		function()
		{
			var world = World.new(universe);
			universe.world = world;
			universe.venueNext = new VenueWorld(world);

			//world.defns.factions["EarthStation"].relationsWithPlayer = Faction.RelationsAllied;
			//var player = world.player;
			//player.credit = 100;
			//player.itemHolder.itemAdd(new Item("Radioactives", 1));
			//player.itemHolder.itemAdd(new Item("ExoticMaterials", 100));

			/*
			var displaySize = universe.display.sizeInPixels;
			var combatSize = new Coords(1, 1).multiplyScalar(displaySize.y * 2);
			var encounter = null; // todo
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
						[
							new Ship("Default"),
						] // ships
					),
					new ShipGroup
					(
						"Other",
						null, // factionName
						[
							new Ship("Default"),	
						] // ships
					)
				]
			);
			var controlShipSelect = combat.toControlShipSelect
			(
				universe, displaySize
			);
			var venueNext = new VenueControls(controlShipSelect);
			universe.venueNext = venueNext;
			*/

			var starsystemStart = world.place.starsystem;
			starsystemStart.factionName = "todo";
			// todo
		}
	);
}
