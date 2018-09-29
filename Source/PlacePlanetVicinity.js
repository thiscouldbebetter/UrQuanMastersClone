
function PlacePlanetVicinity(world, size, planet, playerLoc, placeStarsystem)
{
	this.size = size;
	this.planet = planet;
	this.placeStarsystem = placeStarsystem;

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),

	].addLookups("name");

	this.inputToActionMappings = Ship.inputToActionMappings();

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// planet

	var sizeHalf = this.size.clone().half();

	var planetRadius = entityDimension;
	var planetPos = sizeHalf.clone();
	var planetColor = planet.defn().color;
	var orbitMultiplier = 16;
	var planetOrbitRadius = planet.posAsPolar.radius * orbitMultiplier;
	var planetOrbitVisual = new VisualAnchor
	(
		new VisualCircle(planetOrbitRadius, null, "Gray"),
		planetPos.clone().add
		(
			new Polar
			(
				planet.posAsPolar.azimuthInTurns + .5,
				planetOrbitRadius
			).wrap().toCoords(new Coords())
		) // posToAnchorAt
	);

	var planetVisual = new VisualGroup
	([
		planetOrbitVisual,
		new VisualCircle(planetRadius, planetColor),
	]);
	var planetCollider = new Sphere(planetPos, planetRadius);

	var planetEntity = new Entity
	(
		"Planet",
		[
			planet,
			new Locatable( new Location(planetPos) ),
			new Collidable(planetCollider),
			new Drawable(planetVisual)
		]
	);

	entities.push(planetEntity);

	// satellites

	var orbitColor = "LightGray";
	var satellites = planet.satellites;
	var numberOfMoons = satellites.length;
	for (var i = 0; i < satellites.length; i++)
	{
		var satellite = satellites[i];

		var satelliteEntity = satellite.toEntity(planetPos);

		entities.push(satelliteEntity);
	}

	// player

	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = ShipDefn.visual(entityDimension, playerColor);

	var playerVisual = new VisualGroup
	([
		playerVisualBody,
	]);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Wall"))
		{
			var planet = place.planet;
			var placeStarsystem = place.placeStarsystem;
			var starsystem = placeStarsystem.starsystem;
			var posNext = planet.posAsPolar.toCoords(new Coords()).add
			(
				starsystem.sizeInner.clone().half()
			).add
			(
				new Coords(3, 0).multiplyScalar(planet.radiusOuter)
			);
			world.placeNext = new PlaceStarsystem
			(
				world, starsystem, new Location(posNext)
			);
		}
		else
		{
			if (entityOther.planet != null)
			{
				var planetToOrbit = entityOther.planet;
				world.placeNext = new PlacePlanetOrbit(world, planetToOrbit, place);
			}
			else if (entityOther.shipGroup != null)
			{
				Encounter.create(world, place, entityOther, entityPlayer);
			}
			else if (entityOther.station != null)
			{
				var station = entityOther.station;
				var faction = station.faction(world);
				if (faction.relationsWithPlayer == Faction.RelationsAllied)
				{
					world.placeNext = new PlaceStation(world, station, place);
				}
				else
				{
					Encounter.create(world, place, entityOther, entityPlayer);
				}
			}
		}
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 1);
	//var constraintFriction = new Constraint("Friction", 0.3);
	var constraintTrimToRange = new Constraint("TrimToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			world.player.shipGroup,
			new Locatable(playerLoc),
			new Constrainable([constraintSpeedMax, constraintTrimToRange]),
			new Collidable
			(
				playerCollider,
				[ "collidable" ], // entityPropertyNamesToCollideWith
				playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(),
		]
	);

	entities.push(playerEntity);

	var shipGroups = this.planet.shipGroups;
	for (var i = 0; i < shipGroups.length; i++)
	{
		var shipGroup = shipGroups[i];
		var faction = shipGroup.faction(world);

		var damagerColor = "Red";
		var enemyColor = damagerColor;
		var enemyPos = this.size.clone().subtract(playerLoc.pos);
		var enemyLoc = new Location(enemyPos);

		var enemyColliderAsFace = new Face
		([
			new Coords(0, -entityDimension).half(),
			new Coords(entityDimension, entityDimension).half(),
			new Coords(-entityDimension, entityDimension).half(),
		]);

		var enemyCollider = Mesh.fromFace
		(
			enemyPos, // center
			enemyColliderAsFace,
			1 // thickness
		);

		var enemyVisual = new VisualPolygon
		(
			new Path(enemyColliderAsFace.vertices), enemyColor
		);

		var enemyKill = function(universe, world, place, entity)
		{
			place.entityRemove(entity);
			var planet = place.planet;
			var shipGroup = entity.shipGroup;
			planet.shipGroups.remove(shipGroup);
		}

		var enemyEntity = new Entity
		(
			"Enemy" + i,
			[
				shipGroup,
				new Locatable(enemyLoc),
				new Constrainable([constraintSpeedMax]),
				new Collidable(enemyCollider),
				new Damager(),
				new Killable(1, enemyKill),
				new Drawable(enemyVisual),
				new Talker("todo"),
				new Actor(faction.shipGroupActivity),
			]
		);

		entities.push(enemyEntity);
	}

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

	var wallColor = "DarkViolet";
	var numberOfWalls = 4;
	var wallThickness = 5;

	for (var i = 0; i < numberOfWalls; i++)
	{
		var wallSize;
		if (i % 2 == 0)
		{
			wallSize = new Coords(size.x, wallThickness, 1);
		}
		else
		{
			wallSize = new Coords(wallThickness, size.y, 1);
		}

		var wallPos = wallSize.clone().half().clearZ();
		if (i >= 2)
		{
			wallPos.invert().add(size);
		}

		var wallLoc = new Location(wallPos);
		var wallCollider = new Bounds(wallPos, wallSize);

		var wallEntity = new Entity
		(
			"Wall" + i,
			[
				new Locatable(wallLoc),
				new Collidable(wallCollider),
			]
		);

		entities.push(wallEntity);
	}

	var containerSidebar = world.player.toControlSidebar();
	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlacePlanetVicinity.prototype = Object.create(Place.prototype);
	PlacePlanetVicinity.prototype.constructor = Place;

	PlacePlanetVicinity.prototype.draw_FromSuperclass = PlacePlanetVicinity.prototype.draw;
	PlacePlanetVicinity.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this.drawLoc;
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
