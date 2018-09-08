
function PlaceHyperspace(world, hyperspace, playerPos)
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
				new Modellable(starsystem),
				new Locatable( new Location(starPos) ),
				new Collidable(starCollider),
				new Drawable(starVisual)
			]
		);

		entities.push(starEntity);
	}

	// player

	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = Ship.visual(entityDimension, playerColor);

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
			var starsystem = entityOther.modellable.model;
			world.placeNext = new PlaceStarsystem
			(
				world, starsystem, new Coords(.5, .9).multiply(starsystem.sizeInner)
			);
		}
	}

	var playerShipGroup = world.player.shipGroup;
	var playerShip = playerShipGroup.ships[0];
	var playerShipDefn = playerShip.defn(world);

	var constraintSpeedMax = new Constraint("SpeedMax", playerShipDefn.speedMax);
	var constraintFriction = new Constraint("Friction", 0.1);
	var constraintStopBelowSpeedMin = new Constraint("StopBelowSpeedMin", 0.02);
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
			new Modellable(playerShipGroup),
		]
	);

	entities.push(playerEntity);

	var starsystemSize = this.hyperspace.starsystems[0].sizeInner;
	var containerSidebarSize = new Coords(100, 300); // hack

	var containerSidebar = new ControlContainer
	(
		"containerSidebar",
		new Coords(starsystemSize.x, 0), // pos
		containerSidebarSize,
		// children
		[
			// todo
		]
	);

	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);

	// Helper variables.

	this._drawLoc = new Location(new Coords());
	this._polar = new Polar();
}
{
	PlaceHyperspace.prototype = Object.create(Place.prototype);
	PlaceHyperspace.prototype.constructor = Place;

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
