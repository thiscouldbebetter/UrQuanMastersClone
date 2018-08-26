
function PlacePlanetVicinity(size, planet)
{
	this.size = size;
	this.planet = planet;

	this.actions = Ship.actions();
	this.inputToActionMappings = Ship.inputToActionMappings();

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// planet

	var sizeHalf = this.size.clone().half();

	var planetRadius = entityDimension;
	var planetPos = sizeHalf.clone();
	var planetColor = planet.color;
	var planetVisual = new VisualCircle(planetRadius, planetColor);
	var planetCollider = new Sphere(planetPos, planetRadius);

	var planetEntity = new Entity
	(
		"Planet",
		[
			new Modellable(planet),
			new Locatable( new Location(planetPos) ),
			new Collidable(planetCollider),
			new Drawable(planetVisual)
		]
	);

	entities.push(planetEntity);

	// moons

	var numberOfMoons = 1;
	var moonColor = "LightGray";
	var orbitColor = "LightGray";
	var moonRadius = entityDimension / 2;

	var distanceBetweenMoonOrbits = sizeHalf.y / (numberOfMoons + 1);

	for (var i = 0; i < numberOfMoons; i++)
	{
		var iPlusOne = i + 1;

		var distanceOfMoonFromPlanet = iPlusOne * distanceBetweenMoonOrbits;

		var moonPos = planetPos.clone().add
		(
			new Polar(Math.random(), distanceOfMoonFromPlanet).toCoords(new Coords())
		);

		var moonVisual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(distanceBetweenMoonOrbits * iPlusOne, null, orbitColor),
				planetPos
			),
			new VisualCircle(moonRadius, moonColor)
		]);

		var moonCollider = new Sphere(moonPos, moonRadius);

		var moonEntity = new Entity
		(
			"Moon" + i,
			[
				new Locatable( new Location(moonPos) ),
				new Collidable(moonCollider),
				new Drawable(moonVisual)
			]
		);

		entities.push(moonEntity);
	}

	// player

	var playerPos = new Coords(.5, .9).multiply(this.size);
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = Ship.visual(entityDimension, playerColor);

	var playerVisual = new VisualGroup
	([
		playerVisualBody,
	]);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;
		if (entityOtherName.startsWith("Planet"))
		{
			world.placeNext = new PlacePlanetSurface(place.planet);
		}
		else if (entityOtherName.startsWith("Wall"))
		{
			var planet = place.planet;
			var starsystem = planet.starsystem;
			var posNext = planet.posAsPolar.toCoords(new Coords()).add
			(
				starsystem.sizeInner.clone().half()
			).add
			(
				new Coords(2.5, 0).multiplyScalar(planet.radiusOuter)
			);
			world.placeNext = new PlaceStarsystem
			(
				planet.starsystem, posNext
			);
		}
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 1);
	//var constraintFriction = new Constraint("Friction", 0.3); 
	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable([constraintSpeedMax, constraintWrapToRange]),
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

	this.camera = new Camera
	(
		this.size.clone(),
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
	}
}
