
function PlaceHyperspace(world, hyperspace, playerLoc)
{
	this.hyperspace = hyperspace;
	this.size = this.hyperspace.size;

	var actionMapView = new Action
	(
		"MapView",
		function perform(universe, world, place, actor)
		{
			world.placeNext = new PlaceHyperspaceMap(place);
		}
	);

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),
		actionMapView
	].addLookups("name");

	this.inputToActionMappings = Ship.inputToActionMappings();
	this.inputToActionMappings = this.inputToActionMappings.concat
	(
		[
			new InputToActionMapping("Tab", "MapView"),

			new InputToActionMapping("Gamepad0Button0", "MapView"),
		]
	);
	this.inputToActionMappings.addLookups("inputName");

	this.camera = new Camera
	(
		new Coords(300, 300), // hack
		null, // focalLength
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances.ForwardZDownY.clone()
		)
	);

	// entities

	var entityDimension = hyperspace.starsystemRadiusOuter;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// stars

	var starsystems = this.hyperspace.starsystems;
	var numberOfStars = starsystems.length;
	var starRadius = entityDimension / 2;
	var transformScale = new Transform_Scale
	(
		new Coords(1, 1, 1).multiplyScalar(starRadius)
	);
	var transformRotate = new Transform_Rotate2D(.75);

	var starVisualPath = new PathBuilder().star(5, .5).transform
	(
		transformScale
	).transform
	(
		transformRotate
	);

	var starColors = Starsystem.StarColors;

	var starVisualsForColors = [];
	for (var i = 0; i < starColors.length; i++)
	{
		var starColor = starColors[i];
		var starVisualForColor = new VisualCamera
		(
			new VisualPolygon(starVisualPath, starColor),
			this.camera
		);
		starVisualsForColors[starColor] = starVisualForColor;
	}

	for (var i = 0; i < numberOfStars; i++)
	{
		var starsystem = starsystems[i];
		var starPos = starsystem.posInHyperspace;

		var starCollider = new Sphere(starPos, starRadius);

		var starColor = starsystem.starColor;
		var starVisual = starVisualsForColors[starColor];

		var starEntity = new Entity
		(
			"Star" + i,
			[
				starsystem,
				new Locatable( new Location(starPos) ),
				new Collidable(starCollider),
				new Drawable(starVisual)
			]
		);

		entities.push(starEntity);
	}

	// factions

	var factions = world.defns.factions;
	for (var i = 0; i < factions.length; i++)
	{
		var faction = factions[i];
		var factionCollider = faction.sphereOfInfluence;
		if (factionCollider != null)
		{
			var factionEntity = new Entity
			(
				"Faction" + faction.name,
				[
					new Collidable(factionCollider),
					faction
				]
			);
			entities.push(factionEntity);
		}
	}

	// player

	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = ShipDefn.visual(entityDimension, playerColor);

	var playerVisual = new VisualCamera
	(
		new VisualGroup
		([
			playerVisualBody,
		]),
		this.camera
	);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;
		if (entityOtherName.startsWith("Star"))
		{
			var starsystem = entityOther.starsystem;
			var playerLoc = entityPlayer.locatable.loc;
			var playerOrientation = playerLoc.orientation;
			var playerPosNextAsPolar = new Polar().fromCoords
			(
				playerOrientation.forward
			).addToAzimuthInTurns(.5).wrap();
			playerPosNextAsPolar.radius = starsystem.sizeInner.x * .45;
			var playerPosNext = playerPosNextAsPolar.toCoords(new Coords()).add
			(
				starsystem.sizeInner.clone().half()
			);

			world.placeNext = new PlaceStarsystem
			(
				world,
				starsystem,
				new Location
				(
					playerPosNext,
					playerOrientation.clone()
				)
			);
		}
		else if (entityOtherName.startsWith("ShipGroup"))
		{
			var shipGroupOther = entityOther.shipGroup;
			var encounter = new Encounter
			(
				shipGroupOther.factionName, shipGroupOther, place, entityPlayer.locatable.loc.pos
			);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;
		}
		else if (entityOtherName.startsWith("Faction"))
		{
			var faction = entityOther.faction;
			var factionName = faction.name;

			var numberOfShipGroupsExistingForFaction = 0;
			var entitiesShipGroupsAll = place.entitiesShipGroups();
			for (var i = 0; i < entitiesShipGroupsAll.length; i++)
			{
				var entityShipGroup = entitiesShipGroupsAll[i];
				if (entityShipGroup.shipGroup.factionName == factionName)
				{
					numberOfShipGroupsExistingForFaction++;
				}
			}

			var shipGroupsPerFaction = 1;
			if (numberOfShipGroupsExistingForFaction < shipGroupsPerFaction)
			{
				var shipDefnName = faction.shipDefnName; // todo
				var shipGroup = new ShipGroup
				(
					factionName + Math.random(),
					factionName,
					[
						new Ship(shipDefnName)
					]
				);

				var shipPos = entityPlayer.locatable.loc.pos.clone().add
				(
					new Coords(50, 0)
				);

				var entityShipGroup = new Entity
				(
					"ShipGroup" + faction.name,
					[
						faction,
						shipGroup,
						new Locatable(new Location(shipPos)),
						new Collidable(new Sphere(shipPos, 5)),
						new Drawable
						(
							new VisualCamera
							(
								new VisualGroup([
									new VisualCircle(10, null, "Red"),
									new VisualText(factionName, "White", "Red"),
								]),
								place.camera
							)
						),
					]
				);

				place.entitiesToSpawn.push(entityShipGroup);
			}
		}
	}

	var playerShipGroup = world.player.shipGroup;
	var playerShip = playerShipGroup.ships[0];
	var playerShipDefn = playerShip.defn(world);

	var constraintSpeedMax = new Constraint("SpeedMax", playerShipDefn.speedMax);
	var constraintFriction = new Constraint("Friction", 0.03);
	var constraintStopBelowSpeedMin = new Constraint("StopBelowSpeedMin", 0.005);
	var constraintTrimToRange = new Constraint("TrimToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable
			([
				//constraintSpeedMax,
				constraintFriction,
				constraintStopBelowSpeedMin,
				constraintTrimToRange
			]),
			new Collidable
			(
				playerCollider,
				[ "collidable" ], // entityPropertyNamesToCollideWith
				playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(),
			playerShipGroup,
			playerShipGroup.ships[0]
		]
	);

	entities.push(playerEntity);

	var containerSidebar = world.player.toControlSidebar();
	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);

	// Helper variables.

	this._drawLoc = new Location(new Coords());
	this._polar = new Polar();
}
{
	// superclass

	PlaceHyperspace.prototype = Object.create(Place.prototype);
	PlaceHyperspace.prototype.constructor = Place;

	PlaceHyperspace.prototype.entitiesShipGroups = function()
	{
		return this.entitiesByPropertyName("shipGroup");
	}

	// Place overrides

	PlaceHyperspace.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceHyperspace.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this._drawLoc;
		var drawPos = drawLoc.pos;

		var player = this.entities["Player"];
		var playerLoc = player.locatable.loc;

		var camera = this.camera;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			camera.viewSizeHalf,
			this.size.clone().subtract(camera.viewSizeHalf)
		);

		this.draw_FromSuperclass(universe, world);

		this.venueControls.draw(universe, world);
	}
}
