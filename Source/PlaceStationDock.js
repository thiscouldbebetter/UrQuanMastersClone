
function PlaceStationDock(world, placeStation)
{
	this.placeStation = placeStation;

	var entities = [];
	Place.call(this, entities);
}
{
	// superclass

	PlaceStationDock.prototype = Object.create(Place.prototype);
	PlaceStationDock.prototype.constructor = Place;

	// method

	PlaceStationDock.prototype.offload = function(universe)
	{
		var world = universe.world;
		var player = world.player;
		var playerItemHolder = player.itemHolder;
		var items = playerItemHolder.items;
		var resourceDefns = ResourceDefn.Instances();
		var valueSumSoFar = 0;
		for (var i = 0; i < items.length; i++)
		{
			var item = items[i];
			var itemDefnName = item.defnName;
			var resourceDefn = resourceDefns[itemDefnName];
			var resourceValue = resourceDefn.valuePerUnit * item.quantity;
			valueSumSoFar += resourceValue;
		}
		player.credit += valueSumSoFar;
		items.length = 0;
	}

	// Place

	PlaceStationDock.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceStationDock.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
	}

	PlaceStationDock.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceStationDock.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var placeStationDock = this;

			var player = world.player;
			var playerItemHolder = player.itemHolder;
			var playerShipGroup = player.shipGroup;

			var containerDockSize = universe.display.sizeInPixels.clone();
			var fontHeight = 20;
			var fontHeightShort = fontHeight / 2;
			var buttonBackSize = new Coords(25, 25);
			var marginWidth = 10;
			var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

			var titleSize = new Coords(containerDockSize.x, 25);
			var labelSize = new Coords(100, 10);

			var containerRightSize = new Coords
			(
				(containerDockSize.x - marginSize.x * 3) / 3,
				containerDockSize.y - marginSize.y * 3 - titleSize.y
			);

			var buttonSizeRight = new Coords
			(
				containerRightSize.x - marginSize.x * 2,
				fontHeightShort * 2
			);

			var containerLeftSize = new Coords
			(
				containerDockSize.x - marginSize.x * 3 - containerRightSize.x,
				(containerRightSize.y - marginSize.y) / 2
			);

			var buttonSizeLeft = new Coords
			(
				(containerLeftSize.x - marginSize.x * 3) / 2,
				fontHeightShort * 2
			);

			var containerLeftInnerSize = new Coords
			(
				buttonSizeLeft.x,
				(containerLeftSize.y - labelSize.y - buttonSizeLeft.y - marginSize.y * 4)
			); // size

			var controlRoot = new ControlContainer
			(
				"containerDock",
				new Coords(0, 0), // pos
				containerDockSize,
				[
					new ControlLabel
					(
						"labelDock",
						new Coords(containerDockSize.x / 2, marginSize.y + titleSize.y / 2),
						titleSize,
						true, // isTextCentered
						"Dock",
						fontHeight
					),

					new ControlContainer
					(
						"containerComponents",
						new Coords
						(
							marginSize.x,
							marginSize.y * 2 + titleSize.y
						),
						containerLeftSize,
						// children
						[
							new ControlLabel
							(
								"labelComponentsInstalled",
								marginSize,
								labelSize,
								false, // isTextCentered
								"Installed:",
								fontHeightShort
							),

							new ControlList
							(
								"listComponentsInstalled",
								new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
								containerLeftInnerSize,
								[
									"Cargo Hold",
									"Crew Habitat",
									"Fuel Tank",
									"Ion Cannon",
									"Basic Reactor",
									"Fusion Thruster (4)",
									"Maneuvering Jets (3)",
								],
								new DataBinding(), // bindingForItemText
								fontHeightShort
							),

							new ControlButton
							(
								"buttonComponentScrap",
								new Coords
								(
									marginSize.x,
									containerLeftSize.y - marginSize.y - buttonSizeLeft.y
								),
								buttonSizeLeft,
								"Scrap",
								fontHeightShort,
								true, // hasBorder,
								true, // isEnabled,
								function click(universe)
								{
									// todo
								},
								universe // context
							),

							new ControlLabel
							(
								"labelComponentsAvailable",
								new Coords
								(
									marginSize.x * 2 + containerLeftInnerSize.x,
									marginSize.y
								),
								labelSize,
								false, // isTextCentered
								"Available:",
								fontHeightShort
							),

							new ControlList
							(
								"listComponents",
								new Coords
								(
									marginSize.x * 2 + containerLeftInnerSize.x,
									marginSize.y * 2 + labelSize.y
								),
								containerLeftInnerSize,
								[
									"Cargo Hold",
									"Crew Habitat",
									"Fuel Tank",
									"Ion Cannon",
									"Basic Reactor",
									"Fusion Thruster",
									"Maneuvering Jets",
								],
								new DataBinding(), // bindingForItemText
								fontHeightShort
							),

							new ControlButton
							(
								"buttonComponentBuild",
								new Coords
								(
									marginSize.x * 2 + containerLeftInnerSize.x,
									containerLeftSize.y - marginSize.y - buttonSizeLeft.y
								),
								buttonSizeLeft,
								"Build",
								fontHeightShort,
								true, // hasBorder,
								true, // isEnabled,
								function click(universe)
								{
									// todo
								},
								universe // context
							),
						]
					),

					new ControlContainer
					(
						"containerShips",
						new Coords
						(
							marginSize.x,
							marginSize.y * 3 + titleSize.y + containerLeftSize.y
						),
						containerLeftSize,
						// children
						[
							new ControlLabel
							(
								"labelFleet",
								marginSize,
								labelSize,
								false, // isTextCentered
								"Fleet:",
								fontHeightShort
							),

							new ControlList
							(
								"listShipsInFleet",
								new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
								containerLeftInnerSize,
								[
									"Terran Cruiser",
									"Mollusca Runner",
									"Outsider Batwing",
									"Elfin Saucer",
									"Blob Squelcher",
									"Raptor Aegis",
									"Silconic Gravitar",
								],
								new DataBinding(), // bindingForItemText
								fontHeightShort
							),

							new ControlButton
							(
								"buttonShipScrap",
								new Coords
								(
									marginSize.x,
									containerLeftSize.y - marginSize.y - buttonSizeLeft.y
								),
								buttonSizeLeft,
								"Scrap",
								fontHeightShort,
								true, // hasBorder,
								true, // isEnabled,
								function click(universe)
								{
									// todo
								},
								universe // context
							),

							new ControlLabel
							(
								"labelShipsAvailable",
								new Coords
								(
									marginSize.x * 2 + containerLeftInnerSize.x,
									marginSize.y
								),
								labelSize,
								false, // isTextCentered
								"Available:",
								fontHeightShort
							),

							new ControlButton
							(
								"buttonShipBuild",
								new Coords
								(
									marginSize.x * 2 + containerLeftInnerSize.x,
									containerLeftSize.y - marginSize.y - buttonSizeLeft.y
								),
								buttonSizeLeft,
								"Build",
								fontHeightShort,
								true, // hasBorder,
								true, // isEnabled,
								function click(universe)
								{
									// todo
								},
								universe // context
							),

							new ControlList
							(
								"listShipPlansAvailable",
								new Coords
								(
									marginSize.x * 2 + containerLeftInnerSize.x,
									marginSize.y * 2 + labelSize.y
								),
								containerLeftInnerSize,
								[
									"Terran Cruiser",
									"Mollusca Runner",
									"Raptor Aegis",
								],
								new DataBinding(), // bindingForItemText
								fontHeightShort

							),
						]
					),

					new ControlContainer
					(
						"containerRight",
						new Coords
						(
							marginSize.x * 2 + containerLeftSize.x,
							marginSize.y * 2 + titleSize.y
						),
						containerRightSize,
						// children
						[
							new ControlLabel
							(
								"labelCredit",
								marginSize,
								labelSize,
								false, // isTextCentered
								"Credit: [n]",
								fontHeightShort
							),

							new ControlLabel
							(
								"labelResources",
								new Coords
								(
									marginSize.x, marginSize.y * 2 + labelSize.y
								),
								labelSize,
								false, // isTextCentered
								"Resources:",
								fontHeightShort
							),

							new ControlList
							(
								"listResources",
								new Coords
								(
									marginSize.x,
									marginSize.y * 3 + labelSize.y * 2
								),
								new Coords
								(
									containerRightSize.x - marginSize.x * 2,
									containerRightSize.y - marginSize.y * 5 - labelSize.y * 2 - buttonSizeRight.y
								), // size
								playerItemHolder.items,
								new DataBinding(null, "toString()"), // bindingForItemText
								fontHeightShort,
								new DataBinding(), // bindingForItemSelected
								new DataBinding() // bindingForItemValue
							),

							new ControlButton
							(
								"buttonResourcesOffload",
								new Coords
								(
									marginSize.x,
									containerRightSize.y - marginSize.y - buttonSizeRight.y // todo
								),
								buttonSizeRight,
								"Offload",
								fontHeightShort,
								true, // hasBorder,
								true, // isEnabled,
								function click(universe)
								{
									placeStationDock.offload(universe);
								},
								universe // context
							),

						]
					),

					new ControlButton
					(
						"buttonBack",
						marginSize,
						buttonBackSize,
						"<",
						fontHeight,
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							var world = universe.world;
							var place = world.place;
							var placeNext = place.placeStation;
							world.placeNext = placeNext;
						},
						universe // context
					),
				]
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	PlaceStation.prototype.returnToPlace = function(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entities["Player"];
		var playerLoc = playerFromPlaceNext.locatable.loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
