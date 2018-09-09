
function PlacePlanetSurface(world, planet, placePlanetOrbit)
{
	this.planet = planet;
	this.size = this.planet.sizeSurface;
	this.placePlanetOrbit = placePlanetOrbit;

	var actionExit = new Action
	(
		"Exit",
		function perform(universe, world, place, actor)
		{
			var entityLander = place.entities["Player"];
			var itemHolderLander = entityLander.itemHolder;
			var itemHolderPlayer = world.player.itemHolder;
			itemHolderLander.itemsTransferTo(itemHolderPlayer);

			var placePlanetOrbit = place.placePlanetOrbit;
			world.placeNext = placePlanetOrbit;
		}
	);

	var actionFire = Ship.actionFire();

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),
		actionFire,
		actionExit,

	].addLookups("name");

	this.inputToActionMappings = Ship.inputToActionMappings();
	this.inputToActionMappings = this.inputToActionMappings.concat
	(
		[
			new InputToActionMapping("Enter", "Fire"),
			new InputToActionMapping("_x", "Exit"),

			new InputToActionMapping("Gamepad0Button0", "Fire"),
			new InputToActionMapping("Gamepad0Button1", "Exit"),

		]
	);
	this.inputToActionMappings.addLookups("inputName");

	// constraints

	var constraintSpeedMax = new Constraint("SpeedMax", 3);
	var constraintFriction = new Constraint("Friction", 0.3);
	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// lifeforms

	if (planet.hasLife == true)
	{
		var lifeformActivity = function(universe, world, place, actor)
		{
			var actorLoc = actor.locatable.loc;
			actorLoc.vel.randomize().double().subtract(Coords.Instances.Ones);
		}

		var lifeformColor = "Green";
		var numberOfLifeforms = 8;

		for (var i = 0; i < numberOfLifeforms; i++)
		{
			var lifeformPos = new Coords().randomize().multiply(this.size);
			var lifeformLoc = new Location(lifeformPos);

			var lifeformColliderAsFace = new Face
			([
				new Coords(-1 / 2, -1).multiplyScalar(entityDimension).half(),
				new Coords(1 / 2, -1).multiplyScalar(entityDimension).half(),
				new Coords(1, 1).multiplyScalar(entityDimension).half(),
				new Coords(-1, 1).multiplyScalar(entityDimension).half(),
			]);

			var lifeformCollider = Mesh.fromFace
			(
				lifeformPos, // center
				lifeformColliderAsFace,
				1 // thickness
			);

			var lifeformVisual = new VisualPolygon
			(
				new Path(lifeformColliderAsFace.vertices), lifeformColor
			);

			var lifeformEntity = new Entity
			(
				"Lifeform",
				[
					new Locatable(lifeformLoc),
					new Constrainable([constraintSpeedMax]),
					new Collidable(lifeformCollider),
					new Damager(),
					new Killable(),
					new Drawable(lifeformVisual),
					new Actor(lifeformActivity),
				]
			);

			entities.push(lifeformEntity);

		} // end for

	} // end if planet.hasLife

	var planetDefn = planet.defn();
	var resourceDistributions = planetDefn.resourceDistributions;
	var resourceDefns = ResourceDefn.Instances();
	var resourceRadiusBase = entityDimension / 2;

	for (var i = 0; i < resourceDistributions.length; i++)
	{
		var resourceDistribution = resourceDistributions[i];

		var resourceDefnName = resourceDistribution.resourceDefnName;
		var numberOfDeposits = resourceDistribution.numberOfDeposits;
		var quantityPerDeposit = resourceDistribution.quantityPerDeposit;

		var resourceDefn = resourceDefns[resourceDefnName];

		for (var d = 0; d < numberOfDeposits; d++)
		{
			var resourceColor = resourceDefn.color;
			var resourceGradient = new Gradient
			([
				new GradientStop(0, resourceColor), new GradientStop(1, "Black")
			]);
			var resourceRadius = resourceRadiusBase * Math.sqrt(quantityPerDeposit);
			var resourceVisual = new VisualCircleGradient
			(
				resourceRadius, resourceGradient
			);
			var resourcePos = new Coords().randomize().multiply(this.size);
			var resourceCollider = new Sphere(resourcePos, resourceRadius);

			var resourceEntity = new Entity
			(
				"Resource" + i + "_" + d,
				[
					new Item(resourceDefnName, quantityPerDeposit),
					new Locatable( new Location(resourcePos) ),
					new Collidable(resourceCollider),
					new Drawable(resourceVisual)
				]
			);

			entities.push(resourceEntity);
		}
	}

	// player

	var playerPos = this.size.clone().half(); // todo
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisual = Ship.visual(entityDimension, playerColor, "Black");

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		if (entityOther.item != null)
		{
			var item = entityOther.item;
			entityPlayer.itemHolder.itemAdd(item);
			place.entitiesToRemove.push(entityOther);
		}
		else if (entityOther.name.startsWith("Lifeform") == true)
		{
			place.entitiesToRemove.push(entityOther); // todo
		}
	}

	var playerEntity = new Entity
	(
		"Player",
		[
			new Modellable(world.player.shipGroup), // hack
			new Locatable(playerLoc),
			new Constrainable([constraintFriction, constraintSpeedMax, constraintWrapToRange]),
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
		new Coords(300, 300), // hack
		null, // focalLength
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances.ForwardZDownY.clone()
		)
	);

	var containerSidebar = world.player.toControlSidebar();
	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlacePlanetSurface.prototype = Object.create(Place.prototype);
	PlacePlanetSurface.prototype.constructor = Place;

	PlacePlanetSurface.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlacePlanetSurface.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		var imageBackground = universe.mediaLibrary.imageGetByName("PlanetSurface");

		display.drawImage(imageBackground, Coords.Instances.Zeroes);

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
