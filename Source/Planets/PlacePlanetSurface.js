
function PlacePlanetSurface(world, planet, placePlanetOrbit)
{
	this.planet = planet;
	this.size = this.planet.sizeSurface;
	this.placePlanetOrbit = placePlanetOrbit;

	var actionExit = new Action
	(
		"Exit",
		this.exit.bind(this)
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
	var constraintWrapXTrimY = new Constraint("WrapXTrimY", this.size);

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
	visualBackground = new VisualWrapped(this.planet.sizeSurface, visualBackground);

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
	playerVisual = new VisualWrapped(this.size, playerVisual);

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
			var lifeformDefn = entityOther.lifeform.defn(world);
			var damage = lifeformDefn.damagePerAttack;
			if (damage > 0)
			{
				var chanceOfDamagePerTick = .05;
				if (Math.random() < chanceOfDamagePerTick)
				{
					entityPlayer.killable.integrity -= damage;
				}
			}
		}
	}

	var playerShipLander = new Ship("Lander");

	var playerEntity = new Entity
	(
		"Player",
		[
			playerShipLander,
			new Locatable(playerLoc),
			new Constrainable
			([
				constraintFriction, constraintSpeedMax, constraintWrapXTrimY
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
			new Killable(1, this.playerDie.bind(this))
		]
	);

	entities.push(playerEntity);

	var containerSidebar = this.planet.toControlSidebar();
	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);
	this.propertyNamesToProcess.push("ship");

	// Helper variables.

	this._drawPos = new Coords();
}
{
	// superclass

	PlacePlanetSurface.prototype = Object.create(Place.prototype);
	PlacePlanetSurface.prototype.constructor = Place;

	// methods

	PlacePlanetSurface.prototype.exit = function(universe, world, place, actor)
	{
		var entityLander = place.entities["Player"];
		var itemHolderLander = entityLander.itemHolder;
		var itemHolderPlayer = world.player.flagship.itemHolder;
		itemHolderLander.itemsTransferTo(itemHolderPlayer);

		var placePlanetOrbit = place.placePlanetOrbit;
		world.placeNext = placePlanetOrbit;
	}

	PlacePlanetSurface.prototype.playerDie = function(universe, world, place, entityPlayer)
	{
		this.exit(universe, world, place, entityPlayer);
	}

	// Place overrides

	PlacePlanetSurface.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlacePlanetSurface.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		var drawPos = this._drawPos;

		var player = this.entities["Player"];
		var playerLoc = player.locatable.loc;

		var camera = this.camera;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			new Coords(0, camera.viewSizeHalf.y),
			new Coords(this.size.x, this.size.y - camera.viewSizeHalf.y)
		);

		this.draw_FromSuperclass(universe, world);

		this.venueControls.draw(universe, world);

		this.drawMap(universe, world);
	}

	PlacePlanetSurface.prototype.drawMap = function(universe, world)
	{
		var containerSidebar = this.venueControls.controlRoot;
		var controlMap = containerSidebar.children["containerMap"];
		var mapPos = containerSidebar.pos.clone().add(controlMap.pos);
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;
		var display = universe.display;

		var scanContacts = [];
		var contactVisuals = [];

		scanContacts.push(this.planet.resources);
		contactVisuals.push(new VisualCircle(1, "Red"));

		scanContacts.push(this.planet.lifeforms);
		contactVisuals.push(new VisualCircle(1, "LightGreen"));

		var entityLander = this.entities["Player"];
		scanContacts.push([entityLander.locatable.loc]);
		contactVisuals.push(new VisualCircle(3, null, "Cyan"));

		var contactDrawable = new Drawable();
		contactDrawable.loc = new Location(new Coords());

		for (var t = 0; t < scanContacts.length; t++)
		{
			var contactsOfType = scanContacts[t];
			var contactVisual = contactVisuals[t];
			contactDrawable.visual = contactVisual;

			if (contactsOfType != null)
			{
				for (var i = 0; i < contactsOfType.length; i++)
				{
					var contact = contactsOfType[i];

					var contactPos = contact.pos;
					var drawPos = this._drawPos.overwriteWith
					(
						contactPos
					).divide
					(
						surfaceSize
					).multiply
					(
						mapSize
					).add
					(
						mapPos
					);

					contactDrawable.loc.pos.overwriteWith(drawPos);
					contactVisual.draw(universe, world, display, contactDrawable, contact)
				}
			}
		}
	}
}
