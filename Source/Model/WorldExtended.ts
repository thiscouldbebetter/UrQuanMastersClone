
class WorldExtended extends World
{
	name: string;
	dateCreated: DateTime;
	defn: WorldDefnExtended;
	hyperspace: Hyperspace;
	paraspace: Hyperspace;
	factions: Faction[];
	shipDefns: ShipDefn[];
	player: Player;

	factionsByName: Map<string, Faction>;
	shipDefnsByName: Map<string, ShipDefn>;

	gameTimeInitial: Date;
	gameSecondsSinceStart: number;

	constructor
	(
		name: string,
		dateCreated: DateTime,
		defn: WorldDefnExtended,
		gameTimeInitial: Date,
		hyperspace: Hyperspace,
		paraspace: Hyperspace,
		factions: Faction[],
		shipDefns: ShipDefn[],
		player: Player,
		starsystemStart: Starsystem
	)
	{

		super
		(
			name,
			dateCreated,
			defn,
			null,
			null // placeInitialName
		);

		this.timerTicksSoFar = 0;

		this.gameTimeInitial = gameTimeInitial;
		this.gameSecondsSinceStart = 0;

		this.hyperspace = hyperspace;
		this.paraspace = paraspace;
		this.factions = factions;
		this.shipDefns = shipDefns;
		this.player = player;

		this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
		this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);

		var placeStart = starsystemStart.toPlace
		(
			this, // world
			Disposition.fromPosAndOrientation
			(
				Coords.fromXY(.5, .95).multiply(starsystemStart.sizeInner),
				new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1)),
			),
			null // planet?
		);
		this.placeCurrentSet(placeStart); 
	}

	static create(universe: Universe): World
	{
		var now = DateTime.now();
		var nowAsString = now.toStringMMDD_HHMM_SS();

		var activityDefns =
		[
			Player.activityDefn(),
			Lifeform.activityDefnApproachPlayer(),
			ShipGroupBase.activityDefnApproachPlayer(),
			ShipGroupBase.activityDefnApproachTarget(),
			Lifeform.activityDefnAvoidPlayer(),
			ShipGroupBase.activityDefnDie(),
			Lifeform.activityDefnDoNothing(),
			Combat.activityDefnEnemy(),
			Planet.activityDefnGravitate(),
			ShipGroupBase.activityDefnLeave(),
			Lifeform.activityDefnMoveToRandomPosition()
		];

		var placeDefns = WorldExtended.create_PlaceDefns();

		var hyperspaceSize = Coords.fromXY(1, 1).multiplyScalar(10000);

		// special

		var factions = WorldExtended.create_Factions(hyperspaceSize);

		var shipDefns = ShipDefn.Instances(universe)._All;

		var energySources = EnergySource.Instances()._All;

		var itemDefns = WorldExtended.create_ItemDefns();

		var lifeformDefns = LifeformDefn.Instances()._All;

		var resourceDefns = ResourceDefn.Instances()._All;

		var defn = new WorldDefnExtended
		(
			activityDefns,
			energySources,
			factions,
			itemDefns,
			lifeformDefns,
			placeDefns,
			resourceDefns,
			shipDefns
		);

		var mediaLibrary = universe.mediaLibrary;

		var starsAndPlanetsAsStringCsvCompressed =
			mediaLibrary.textStringGetByName("StarsAndPlanets").value;

		var starsystemSizeInner = Coords.fromXY(1, 1).multiplyScalar(300);

		var hyperspace = Hyperspace.fromFileContentsAsString
		(
			hyperspaceSize,
			starsystemSizeInner,
			factions,
			energySources,
			starsAndPlanetsAsStringCsvCompressed
		);

		var paraspace = WorldExtended.create_Paraspace(hyperspace, factions);

		WorldExtended.create_StarsystemDetails(universe, hyperspace, factions);

		var starsystemStart = hyperspace.starsystemByName("Sol");
		var player = WorldExtended.create_Player(starsystemStart);

		var shipDefns = ShipDefn.Instances(universe)._All;

		var returnValue = new WorldExtended
		(
			"World-" + nowAsString,
			now, // dateCreated
			defn,
			new Date(Date.UTC(2155, 1, 17, 9, 27, 22)),
			hyperspace,
			paraspace,
			factions,
			shipDefns,
			player,
			starsystemStart
		);

		return returnValue;
	}

	static create_Factions(hyperspaceSize: Coords): Faction[]
	{
		var textConversation = "Conversation-";

		var textLahkemupGuardDrone = "LahkemupGuardDrone";
		var lahkemupGuardDrone = new Faction
		(
			textLahkemupGuardDrone,
			null, // nameOriginal
			null, // color
			true, // talksImmediately
			textConversation + textLahkemupGuardDrone, // conversationDefnName
			null, // territory
			"GuardDrone", // shipDefnName
			DiplomaticRelationshipType.Instances().Hostile,
			Activity.fromDefnName(ShipGroupBase.activityDefnApproachPlayer().name)
		);

		// normal

		var f =
		(
			name: string,
			nameOriginal: string,
			color: Color,
			territory: FactionTerritory,
			diplomaticRelationshipTypeWithPlayerDefault: DiplomaticRelationshipType,
			shipDefnName: string
		) =>
		{
			var talksImmediately = (territory == null); // hack

			return new Faction
			(
				name,
				nameOriginal,
				color,
				talksImmediately,
				textConversation + name, // conversationDefnName
				territory,
				shipDefnName,
				diplomaticRelationshipTypeWithPlayerDefault,
				Activity.fromDefnName(ShipGroupBase.activityDefnApproachPlayer().name)
			);
		}

		var soi = (centerX: number, centerY: number, radius: number) =>
		{
			var sphere = Sphere.fromCenterAndRadius
			(
				Coords.fromXY(centerX, 1000 - centerY).multiplyScalar(10),
				radius * hyperspaceSize.x
			);
			var territory = new FactionTerritory(sphere);
			return territory;
		}

		var c = Color.Instances();

		var relationshipTypes = DiplomaticRelationshipType.Instances();
		var hostile = relationshipTypes.Hostile;
		var neutral = relationshipTypes.Neutral;

		var daaskap 			= f("Daaskap", 				"Druuge", 		c.Red, 	 	soi(946.9, 280.6, .1), 	neutral, "Kickback");
		var ellfyn				= f("Ellfyn", 				"Arilou", 		c.Blue, 	soi(100, 500, .05), 	neutral, "Discus");
		var famorfex 			= f("Famorfex", 			"Umgah", 		c.Violet, 	soi(197.8, 596.8, .1), 	hostile, "Pustule");
		var grimmotz 			= f("Grimmotz", 			"Utwig", 		c.Cyan, 	soi(863.0, 869.3, .1), 	neutral, "Punishpunj");
		var hyphae 				= f("Hyphae", 				"Mycon", 		c.Purple, 	soi(629.1, 220.8, .12), hostile, "Sporsac");
		var kehlemal 			= f("Kehlemal", 			"Kohrah", 		c.Gray, 	soi(610, 610, .25), 	hostile, "Silencer");
		var lahkemup 			= f("Lahkemup",				"Urquan", 		c.Green,	soi(590, 590, .25), 	hostile, "Shackler");
		var konstalyxz 			= f("Konstalyxz", 			"Chmmr", 		null, 		null, 					neutral, "Gravitar");
		var mauluska 			= f("Mauluska", 			"Spathi", 		c.Brown, 	soi(241.6, 368.7, .12), neutral, "Scuttler");
		var mauluskaHomeworld 	= f("Mauluska-Homeworld", 	"SafeOnes", 	c.Brown, 	soi(241.6, 368.7, .12), neutral, "Scuttler");
		var muunfaz 			= f("Muunfaz", 				"Pkunk", 		c.Cyan, 	soi(52.2, 52.5, .1), 	neutral, "Fireblossom");
		var mazonae 			= f("Mazonae", 				"Syreen", 		null, 		null, 					neutral, "Elysian");
		var murch 				= f("Murch", 				"Melnorme", 	null, 		null, 					neutral, "Indemnity");
		var outz 				= f("Outz", 				"Orz", 			c.Purple,	soi(371.3, 253.7, .1), 	neutral, "Wingshadow");
		var raknoid 			= f("Raknoid", 				"Ilwrath", 		c.Purple, 	soi(22.9, 366.6, .15), 	hostile, "Infernus");
		var raptodact 			= f("Raptodact", 			"Yehat", 		c.Violet,	soi(492.3, 29.4, .1), 	neutral, "Aegis");
		//var raptorRebel 		= f("RaptorRebel", 	"Yehat", 	c("Mauve"), soi(492.3, 29.4, .1), 	neutral, "Aegis");
		//var raptorRoyalist	= f("RaptorRoyalist","Yehat", 	c("Violet"),soi(492.3, 29.4, .1), 	neutral, "Aegis");
		var supian				= f("Supian", 				"Shofixti",		null,		null, 					hostile, "Starbright");
		var terran 				= f("Terran", 				"Earthling", 	null, 		null,					neutral, "Broadsider");
		var tempestrial 		= f("Tempestrial", 			"Slylandro", 	null, 		soi(500, 500, 1000), 	hostile, "Tumbler");
		var triunion			= f("Triunion", 			"Zoqfotpik", 	c.Red, 		soi(400, 543.7, .067), 	neutral, "Nitpiknik");
		var twyggan 			= f("Twyggan", 				"Supox", 		c.Brown, 	soi(741.4, 912.4, .1), 	neutral, "Efflorescence");
		var ugglegruj 			= f("Ugglegruj", 			"VUX", 			c.Blue, 	soi(433.3, 168.7, .12), hostile, "Encumbrator");
		var vaarphig			= f("Vaarphig", 			"Thraddash", 	c.Cyan, 	soi(253.5, 835.8, .1), 	hostile, "Afterburner");

		var factions =
		[
			daaskap,
			ellfyn,
			famorfex,
			grimmotz,
			hyphae,
			kehlemal,
			konstalyxz,
			lahkemup,
			lahkemupGuardDrone,
			mauluska,
			mauluskaHomeworld,
			muunfaz,
			mazonae,
			murch,
			outz,
			raknoid,
			raptodact,
			supian,
			tempestrial,
			terran,
			triunion,
			twyggan,
			ugglegruj,
			vaarphig
		];

		return factions;
	}

	static create_ItemDefns(): ItemDefn[]
	{
		var itemDefns =
		[
			ItemDefn.fromNameAndUse
			(
				"HummingSpiral",
				WorldDefnExtended.itemDefn_HummingSpiral_Use
			),

			ItemDefn.fromNameAndUse
			(
				"ParaspacePortalProjector",
				WorldDefnExtended.itemDefn_ParaspacePortalProjector_Use
			),

			ItemDefn.fromNameAndUse
			(
				"ShimmeringHemitrope",
				WorldDefnExtended.itemDefn_ShimmeringHemitrope_Use
			),

			ItemDefn.fromNameAndUse
			(
				"TranslucentOblong",
				WorldDefnExtended.itemDefn_TranslucentOblong_Use
			),
		];

		return itemDefns;
	}

	static create_Paraspace(hyperspace: Hyperspace, factions: Faction[]): Hyperspace
	{
		// Create paraspace.

		const hyperspaceName = "Hyperspace";
		const paraspaceName = "Paraspace";

		const paraspaceLinkPortalName = "UNKNOWN";
		let lp = (fromPos: Coords, toPos: Coords) =>
		{
			return new LinkPortal
			(
				paraspaceLinkPortalName,
				fromPos,
				hyperspaceName,
				toPos
			);
		};

		var paraspaceSize = hyperspace.size.clone();
		var factionEllfyn = factions.find(x => x.name == "Ellfyn");
		var paraspaceLinkPortals =
		[
			new LinkPortal
			(
				paraspaceLinkPortalName,
				Coords.fromXY(6134, 5900), // pos
				Encounter.name + "-" + factionEllfyn.name,
				null // destinationPos
			),

			lp(Coords.fromXY(4480, 5040), Coords.fromXY(5658, 9712) ), // Lyncis (Freaky Beast)
			lp(Coords.fromXY(4580, 4920), Coords.fromXY(8607,  151) ), // Trianguli (SE)
			lp(Coords.fromXY(4660, 5140), Coords.fromXY(2302, 3988) ), // Gruis (Mauluska) 
			lp(Coords.fromXY(4680, 4640), Coords.fromXY(9211, 6104) ), // Arcturus (Ttorsting)
			lp(Coords.fromXY(4760, 4580), Coords.fromXY(4091, 7748) ), // Monocerotis (Lahk-Emup NW)
			lp(Coords.fromXY(4760, 4960), Coords.fromXY(6117, 4131) ), // Camelopardalis (Lahk-Emup S)
			lp(Coords.fromXY(4880, 5380), Coords.fromXY(9735, 3153) ), // Persei (Daaskap) 
			lp(Coords.fromXY(4920, 4920), Coords.fromXY(  50, 1647) ), // Mizar (Raknoid)
			lp(Coords.fromXY(5020, 4600), Coords.fromXY(3184, 4906) ), // Capricorni (Triunion)
			lp(Coords.fromXY(5060, 4740), Coords.fromXY(1910,  962) ), // Lyrae (Sol)
			lp(Coords.fromXY(5160, 4660), Coords.fromXY(5673, 1207) ), // Sculptoris (Hyphae)
			lp(Coords.fromXY(5200, 5140), Coords.fromXY( 103, 9404) ), // Corvi (Tempestrials)
			lp(Coords.fromXY(5200, 5400), Coords.fromXY(5850, 6213) ), // Crateris (Lahk-Emup Center)
			lp(Coords.fromXY(5300, 5280), Coords.fromXY(7752, 8906) ), // Librae (Twyggan)
			lp(Coords.fromXY(5440, 5320), Coords.fromXY( 368, 6332) ), // Circini (Elfynn)
		];

		var paraspace = Hyperspace.fromNameSizeAndLinkPortals
		(
			paraspaceName,
			paraspaceSize,
			paraspaceLinkPortals
		).pixelsTraversablePerFuelUnitSet(Number.POSITIVE_INFINITY);

		// Add a portal to paraspace in hyperspace,
		// and multiple portals to hyperspace in paraspace.
		var paraspacePortalPos = Coords.fromXY(438, 6372);
		var linkPortal = new LinkPortal
		(
			paraspaceLinkPortalName,
			paraspacePortalPos,
			paraspaceName,
			Coords.fromXY(5000, 5000) // destinationPos
		);
		hyperspace.linkPortalAdd(linkPortal);

		return paraspace;
	}

	static create_PlaceDefns(): PlaceDefn[]
	{
		var entityPropertyNamesToProcess = 
		[
			Actor.name,
			Damager.name,
			Ephemeral.name,
			Killable.name,
			Playable.name,

			CollisionTrackerBase.name,
			Locatable.name,
			Constrainable.name,
			Collidable.name,
			Boundable.name,
			Movable.name,

			GameClock.name,

			//Drawable.name,
			//Camera.name
		];


		var actions = Ship.actions();
		var actionsCombat = Combat.actions();
		var actionToInputsMappings = Ship.actionToInputsMappings();

		var placeDefns = 
		[
			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlaceCombat.name,
				"Music_Combat",
				actionsCombat,
				actionToInputsMappings,
				entityPropertyNamesToProcess.slice(0).concat([Ship.name])
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlaceEncounter.name,
				"Music_Encounter",
				actions,
				actionToInputsMappings,
				[] // propertyNamesToProcess
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlaceHyperspace.name,
				"Music_Hyperspace",
				actions,
				actionToInputsMappings,
				entityPropertyNamesToProcess.slice(0).concat( [ Fuelable.name ] )
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlaceHyperspaceMap.name,
				"Music_Hyperspace",
				actions,
				actionToInputsMappings,
				entityPropertyNamesToProcess
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlacePlanetOrbit.name,
				"Music_Planet",
				actions,
				actionToInputsMappings,
				entityPropertyNamesToProcess
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlacePlanetSurface.name,
				"Music_Planet",
				actionsCombat,
				actionToInputsMappings,
				entityPropertyNamesToProcess.slice(0).concat( [ EntityGenerator.name ] )
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlacePlanetVicinity.name,
				"Music_Starsystem",
				actions,
				actionToInputsMappings,
				entityPropertyNamesToProcess
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlaceStarsystem.name,
				"Music_Starsystem",
				actions,
				actionToInputsMappings,
				entityPropertyNamesToProcess
			),

			PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
			(
				PlaceStation.name,
				"Music_Music",
				actions,
				actionToInputsMappings,
				entityPropertyNamesToProcess
			),
		];

		return placeDefns;
	}

	static create_Player(starsystemStart: Starsystem): Player
	{
		var playerShipDefnName = "Flagship";
		var playerShip = Ship.fromDefnName(playerShipDefnName);
		var playerShips =
		[
			playerShip,
			Ship.fromDefnName("Broadsider")
		];

		var playerShipGroup = new ShipGroupFinite
		(
			"Player",
			"Player", // factionName
			starsystemStart.posInHyperspace.clone(), // pos
			13, // shipsMax
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
				shipComponentDefns.CargoBay.name,
				shipComponentDefns.CrewHabitat.name,
				shipComponentDefns.FuelTank.name,
				shipComponentDefns.TurningJets.name,
			], // componentNames
			1, // numberOfLanders
			50, // crew
			100, // fuel
			0, // resourceCredits
			0, // infoCredits
			[], // items
			30 // shipsMax
		);

		//var factionNamesAll = factions.elementProperties("name");

		var player = new Player
		(
			"Player",
			playerFlagship,
			playerShipGroup,
			null // diplomaticRelationships
		);

		return player;
	}

	static create_StarsystemDetails
	(
		universe: Universe, hyperspace: Hyperspace, factions: Faction[]
	): void
	{
		var starsystemStart = hyperspace.starsystemByName("Sol");
		starsystemStart.solarSystem(universe);

		var starsystems = hyperspace.starsystems;
		var starsystemsSupergiant = starsystems.filter(x => x.starSizeIndex == 2);
		var factionMurch = factions.find(x => x.name == "Murch");
		starsystemsSupergiant.forEach
		(
			starsystem =>
			{
				var shipGroup = new ShipGroupFinite
				(
					factionMurch.name + " " + "Ship Group",
					factionMurch.name,
					Coords.random(universe.randomizer).multiply(starsystem.sizeInner),
					null, // shipsMax
					[
						Ship.fromDefnName(factionMurch.shipDefnName)
					]
				);

				starsystem.shipGroupAdd(shipGroup);
			}
		);

		var starsystemForTriunionEnvoys =
			hyperspace.starsystemByName("Rigel");
		var factionTriunion = factions.find(x => x.name == "Triunion");
		var shipGroupTriunion = new ShipGroupFinite
		(
			factionTriunion.name + " " + "Ship Group",
			factionTriunion.name,
			Coords.random(universe.randomizer).multiply(starsystemForTriunionEnvoys.sizeInner),
			null, // shipsMax
			[
				Ship.fromDefnName(factionMurch.shipDefnName)
			]
		);

		starsystemForTriunionEnvoys.shipGroupAdd(shipGroupTriunion);
	}

	// instance methods

	defnExtended(): WorldDefnExtended
	{
		return this.defn as WorldDefnExtended;
	}

	draw(universe: Universe): void
	{
		this.placeCurrent.draw(universe, universe.world, universe.display);
	}

	faction(factionName: string): Faction
	{
		return this.factionByName(factionName);
	}

	factionByName(factionName: string): Faction
	{
		var faction = this.factionsByName.get(factionName);
		if (faction == null)
		{
			throw new Error("No faction found with name '" + factionName + "'.");
		}
		return faction;
	}

	gameTimeAsString(): string
	{
		var millisecondsPerSecond = 1000;
		var timeCurrentInMilliseconds =
			this.gameTimeInitial.getTime()
			+ this.gameSecondsSinceStart * millisecondsPerSecond;
		var timeCurrentAsDate = new Date(timeCurrentInMilliseconds);
		var timeCurrentAsString = timeCurrentAsDate.toISOString();
		return timeCurrentAsString;
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		this.placeCurrent.initialize(uwpe.worldSet(this));
	}

	placeByName(placeName: string): Place
	{
		var returnPlace: Place;

		var placeNameParts = placeName.split(":");
		var placeTypeName = placeNameParts[0];
		var placeNameActual = placeNameParts[1];
		if (placeTypeName == PlaceHyperspace.name)
		{
			throw new Error("Not yet implemented!");
		}
		else if (placeTypeName == PlacePlanetVicinity.name)
		{
			var planetName = placeNameActual;
			var starsystem = this.hyperspace.starsystems.find
			(
				x => x.planets.some
				(
					y => y.name == planetName
				)
			);
			var planet = starsystem.planets.find(x => x.name == planetName);
			returnPlace = planet.toPlace(this);
		}
		else if (placeTypeName == PlaceStarsystem.name)
		{
			throw new Error("Not yet implemented!");
		}
		else
		{
			throw new Error("Unrecognized place type: " + placeTypeName);
		}

		return returnPlace;
	}

	planetByName(planetName: string): Planet
	{
		var planetNameParts = planetName.split(" ");
		var starsystemName =
			planetNameParts[0] + " " + planetNameParts[1];
		var starsystem =
			this.starsystemByName(starsystemName);
		var planet = starsystem.planetByName(planetName);
		return planet;
	}

	shipDefnByName(shipDefnName: string): ShipDefn
	{
		return this.shipDefnsByName.get(shipDefnName);
	}

	starsystemByName(name: string)
	{
		return this.hyperspace.starsystemByName(name);
	}

	// World overrides.

	placeGetByName(name: string): Place
	{
		return this.placeCurrent; // hack
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		super.updateForTimerTick(uwpe);
	}

	toControl(universe: Universe): ControlBase
	{
		return new ControlNone();
	}

	toVenue(): VenueWorld
	{
		return new VenueWorld(this);
	}
}
