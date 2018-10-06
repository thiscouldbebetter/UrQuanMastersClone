
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
			var itemHolderPlayer = world.player.flagship.itemHolder;
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
			new InputToActionMapping("Enter", "Fire", true),
			new InputToActionMapping("_", "Exit"),

			new InputToActionMapping("Gamepad0Button0", "Fire"),
			new InputToActionMapping("Gamepad0Button1", "Exit"),
		]
	);
	this.inputToActionMappings.addLookups("inputName");

	// constraints

	var constraintSpeedMax = new Constraint("SpeedMax", 10);
	var constraintFriction = new Constraint("Friction", 0.1);
	var constraintTrimToRange = new Constraint("TrimToRange", this.size);

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

	var entities = [];

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	// background

	var visualBackground = new VisualImage("PlanetSurface", this.planet.sizeSurface);
	visualBackground = new VisualCamera(visualBackground, this.camera);
	var entityBackground = new Entity
	(
		"Background",
		[
			new Locatable(new Location( this.planet.sizeSurface.clone().half() )),
			new Drawable(visualBackground)
		]
	);

	entities.push(entityBackground);

	// lifeforms

	if (planet.hasLife == true)
	{
		var lifeforms = planet.lifeforms;
		for (var i = 0; i < lifeforms.length; i++)
		{
			var lifeform = lifeforms[i];
			var lifeformEntity = lifeform.toEntity(world, this);
			entities.push(lifeformEntity);
		}

	} // end if planet.hasLife

	var resourceDefns = ResourceDefn.Instances();
	var resourceRadiusBase = entityDimension / 2;
	var resources = this.planet.resources;
	resources = (resources == null ? [] : resources);

	for (var i = 0; i < resources.length; i++)
	{
		var resource = resources[i];
		var entityResource = resource.toEntity(world, this, resourceRadiusBase);
		entities.push(entityResource);
	}

	// player

	var playerPos = this.size.clone().half(); // todo
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisual = new VisualCamera
	(
		ShipDefn.visual(entityDimension, playerColor, "Black"),
		this.camera
	);

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

	var playerShipLander = new Ship("Lander");

	var playerEntity = new Entity
	(
		"Player",
		[
			playerShipLander,
			new Locatable(playerLoc),
			new Constrainable([constraintFriction, constraintSpeedMax, constraintTrimToRange]),
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

	var containerSidebar = this.planet.toControlSidebar();
	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);
	this.propertyNamesToProcess.push("ship");

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	// superclass

	PlacePlanetSurface.prototype = Object.create(Place.prototype);
	PlacePlanetSurface.prototype.constructor = Place;

	// Place overrides

	PlacePlanetSurface.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlacePlanetSurface.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		//var imageBackground = universe.mediaLibrary.imageGetByName("PlanetSurface");
		//display.drawImage(imageBackground, Coords.Instances.Zeroes);

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
