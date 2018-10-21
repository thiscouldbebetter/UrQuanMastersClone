
function PlacePlanetOrbit(world, planet, placePlanetVicinity)
{
	this.planet = planet;
	this.placePlanetVicinity = placePlanetVicinity;

	var entities = [];
	Place.call(this, entities);

	this._drawPos = new Coords();
}
{
	// superclass

	PlacePlanetOrbit.prototype = Object.create(Place.prototype);
	PlacePlanetOrbit.prototype.constructor = Place;

	// methods

	PlacePlanetOrbit.prototype.land = function(universe)
	{
		var world = universe.world;
		var placeOrbit = world.place;
		var planet = placeOrbit.planet;
		var placeNext = new PlacePlanetSurface(world, planet, placeOrbit);
		world.placeNext = placeNext;
	}

	PlacePlanetOrbit.prototype.returnToPlaceParent = function(universe)
	{
		var world = universe.world;
		var placeOrbit = world.place;
		var placePlanetVicinity = placeOrbit.placePlanetVicinity;
		world.placeNext = placePlanetVicinity;
	}

	PlacePlanetOrbit.prototype.scanEnergy = function(universe)
	{
		this.hasEnergyBeenScanned = true;
	}

	PlacePlanetOrbit.prototype.scanLife = function(universe)
	{
		this.hasLifeBeenScanned = true;
	}

	PlacePlanetOrbit.prototype.scanMinerals = function(universe)
	{
		this.haveMineralsBeenScanned = true;
	}

	// overrides

	PlacePlanetOrbit.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlacePlanetOrbit.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);

		var controlMap = this.venueControls.controlRoot.children["containerMap"];
		var mapPos = controlMap.pos;
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;
		var display = universe.display;

		var scanContacts = [];
		var contactVisuals = [];

		if (this.haveMineralsBeenScanned)
		{
			scanContacts.push(this.planet.resources);
			contactVisuals.push(new VisualCircle(3, "Red"));
		}

		if (this.hasLifeBeenScanned)
		{
			scanContacts.push(this.planet.lifeforms);
			contactVisuals.push(new VisualCircle(3, "LightGreen"));
		}

		if (this.hasEnergyBeenScanned)
		{
			if (this.planet.energySources != null)
			{
				scanContacts.push(this.planet.energySources);
				contactVisuals.push(new VisualCircle(3, "White"));
			}
		}

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

	PlacePlanetOrbit.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlacePlanetOrbit.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var controlRoot = this.toControl(universe, world);
			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	// controls

	PlacePlanetOrbit.prototype.toControl = function(universe, world)
	{
		var placePlanetOrbit = this;
		var planet = this.planet;

		var containerMainSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var fontHeightShort = fontHeight / 2;
		var buttonBackSize = new Coords(1, 1).multiplyScalar(1.6 * fontHeightShort);
		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

		var titleSize = new Coords(containerMainSize.x, 25);
		var labelSize = new Coords(200, 10);

		var containerRightSize = new Coords
		(
			(containerMainSize.x - marginSize.x * 3) / 4,
			containerMainSize.y - marginSize.y * 3 - titleSize.y
		);

		var buttonSizeRight = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			fontHeightShort * 1.5
		);

		var buttonScanSize = new Coords
		(
			containerRightSize.x - marginSize.x * 4,
			buttonSizeRight.y
		);

		var containerScanSize = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			buttonScanSize.y * 3 + marginSize.y * 4
		);

		var containerMapSize = new Coords
		(
			containerMainSize.x - marginSize.x * 3 - containerRightSize.x,
			(containerRightSize.y - marginSize.y) / 2
		);

		var containerInfoSize = new Coords
		(
			(containerMapSize.x - marginSize.x) / 2,
			containerMapSize.y
		);

		var containerInfo = new ControlContainer
		(
			"containerInfo",
			new Coords
			(
				marginSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerInfoSize,
			// children
			[
				new ControlLabel
				(
					"labelName",
					new Coords(marginSize.x, marginSize.y),
					labelSize,
					false, // isTextCentered
					"Name: " + planet.name,
					fontHeightShort
				),

				new ControlLabel
				(
					"labelMass",
					new Coords(marginSize.x, marginSize.y * 2),
					labelSize,
					false, // isTextCentered
					"Mass: " + planet.mass.toExponential(3).replace("e", " x 10^").replace("+", "") + " kg",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelRadius",
					new Coords(marginSize.x, marginSize.y * 3),
					labelSize,
					false, // isTextCentered
					"Radius: " + planet.radius + " km",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelGravity",
					new Coords(marginSize.x, marginSize.y * 4),
					labelSize,
					false, // isTextCentered
					"Surface Gravity: " + planet.gravity + "g",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelOrbitDistance",
					new Coords(marginSize.x, marginSize.y * 5),
					labelSize,
					false, // isTextCentered
					"Orbit: " + planet.orbit.toExponential(3).replace("e", " x 10^").replace("+", "") + " km",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelRotationPeriod",
					new Coords(marginSize.x, marginSize.y * 6),
					labelSize,
					false, // isTextCentered
					"Day: " + planet.day + " hours",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelOrbitPeriod",
					new Coords(marginSize.x, marginSize.y * 7),
					labelSize,
					false,
					"Year: " + planet.year + " Earth days",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelTemperature",
					new Coords(marginSize.x, marginSize.y * 8),
					labelSize,
					false,
					"Temperature: " + planet.temperature + " C",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelWeather",
					new Coords(marginSize.x, marginSize.y * 9),
					labelSize,
					false,
					"Weather: Class " + planet.weather,
					fontHeightShort
				),

				new ControlLabel
				(
					"labelTectonics",
					new Coords(marginSize.x, marginSize.y * 10),
					labelSize,
					false,
					"Tectonics: Class " + planet.tectonics,
					fontHeightShort
				),
			]
		);

		var containerGlobe = new ControlContainer
		(
			"containerGlobe",
			new Coords
			(
				marginSize.x * 2 + containerInfoSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerInfoSize,
			// children
			[
				new ControlVisual
				(
					"visualGlobe",
					new Coords(0, 0),
					containerInfoSize,
					new VisualGroup
					([
						new VisualRectangle(containerInfoSize, "Black"),
						new VisualCircle(containerInfoSize.y * .4, "Gray"),
						new VisualCircleGradient
						(
							containerInfoSize.y * .4,
							new Gradient
							([
								new GradientStop(0, planet.defn().color),
								new GradientStop(1, "Black")
							]),
							planet.defn().color
						)
					])
				)
			]
		);

		var containerRight = new ControlContainer
		(
			"containerRight",
			new Coords
			(
				marginSize.x * 2 + containerMapSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerRightSize,
			// children
			[
				new ControlLabel
				(
					"labelScan",
					new Coords
					(
						marginSize.x,
						containerRightSize.y
							- marginSize.y * 3
							- buttonSizeRight.y
							- containerScanSize.y
							- labelSize.y
					),
					labelSize,
					fontHeightShort,
					"Scan:"
				),

				new ControlContainer
				(
					"containerScan",
					new Coords
					(
						marginSize.x,
						containerRightSize.y
							- marginSize.y * 2
							- buttonSizeRight.y
							- containerScanSize.y
					),
					containerScanSize,
					[
						new ControlButton
						(
							"buttonScanMineral",
							new Coords
							(
								marginSize.x,
								marginSize.y
							),
							buttonScanSize,
							"Mineral",
							fontHeightShort,
							true, // hasBorder,
							true, // isEnabled,
							function click(universe)
							{
								placePlanetOrbit.scanMinerals(universe);
							},
							universe
						),

						new ControlButton
						(
							"buttonScanLife",
							new Coords
							(
								marginSize.x,
								marginSize.y * 2 + buttonScanSize.y
							),
							buttonScanSize,
							"Life",
							fontHeightShort,
							true, // hasBorder,
							true, // isEnabled,
							function click(universe)
							{
								placePlanetOrbit.scanLife(universe);
							},
							universe
						),

						new ControlButton
						(
							"buttonScanEnergy",
							new Coords
							(
								marginSize.x,
								marginSize.y * 3 + buttonScanSize.y * 2
							),
							buttonScanSize,
							"Energy",
							fontHeightShort,
							true, // hasBorder,
							true, // isEnabled,
							function click(universe)
							{
								placePlanetOrbit.scanEnergy(universe);
							},
							universe
						),
					]
				),

				new ControlButton
				(
					"buttonLand",
					new Coords
					(
						marginSize.x,
						containerRightSize.y - marginSize.y - buttonSizeRight.y
					),
					buttonSizeRight,
					"Land",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						placePlanetOrbit.land(universe);
					},
					universe
				),
			]
		);

		var controlRoot = new ControlContainer
		(
			"containerPlanetOrbit",
			new Coords(0, 0), // pos
			containerMainSize,
			[
				new ControlLabel
				(
					"labelOrbit",
					new Coords(containerMainSize.x / 2, marginSize.y + titleSize.y / 2),
					titleSize,
					true, // isTextCentered
					"Orbit",
					fontHeight
				),

				containerInfo,

				containerGlobe,

				new ControlContainer
				(
					"containerMap",
					new Coords
					(
						marginSize.x,
						marginSize.y * 3 + titleSize.y + containerMapSize.y
					),
					containerMapSize,
					// children
					[
						new ControlVisual
						(
							"visualSurface",
							Coords.Instances.Zeroes,
							containerMapSize,
							new VisualImageFromLibrary("PlanetSurface", containerMapSize)
						),
					]
				),

				containerRight,

				new ControlButton
				(
					"buttonBack",
					marginSize,
					buttonBackSize,
					"<",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.returnToPlaceParent.bind(this),
					universe // context
				),
			]
		);

		return controlRoot;
	}

}
