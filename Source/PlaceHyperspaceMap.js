
function PlaceHyperspaceMap(placeHyperspaceToReturnTo)
{
	this.placeHyperspaceToReturnTo = placeHyperspaceToReturnTo;

	this._drawPos = new Coords();

	Place.call(this, []);
}
{
	PlaceHyperspaceMap.prototype = Object.create(Place.prototype);
	PlaceHyperspaceMap.prototype.constructor = Place;

	PlaceHyperspaceMap.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceHyperspaceMap.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);

		var display = universe.display;

		//display.drawBackground("Gray", "Black");

		var hyperspace = this.placeHyperspaceToReturnTo.hyperspace;
		var hyperspaceSize = hyperspace.size;
		var controlRoot = this.venueControls.controlRoot;
		var containerMap = controlRoot.children["containerMap"];
		var mapPos = containerMap.pos;
		var mapSize = containerMap.size;
		display.drawRectangle(mapPos, mapSize, "Black", "Gray");

		var drawPos = this._drawPos;
		var starRadius = 1;
		var starsystems = hyperspace.starsystems;
		for (var i = 0; i < starsystems.length; i++)
		{
			var starsystem = starsystems[i];
			var starColor = starsystem.starColor;
			var starsystemPos = starsystem.posInHyperspace;

			drawPos.overwriteWith
			(
				starsystemPos
			).divide
			(
				hyperspaceSize
			).multiply
			(
				mapSize
			).add
			(
				mapPos
			);

			display.drawCircle(drawPos, starRadius, starColor);
		}

		var entityForPlayer =
			this.placeHyperspaceToReturnTo.entitiesByPropertyName("playable")[0];
		var playerPos = entityForPlayer.locatable.loc.pos;
		drawPos.overwriteWith(playerPos).divide(hyperspaceSize).multiply(mapSize);
		var reticleSize = new Coords(1, 1).multiplyScalar(starRadius * 4);
		display.drawRectangleCentered(drawPos, reticleSize, null, "Gray");

		/*
		var shipGroup = entityForPlayer.modellable.model;
		var ship = shipGroup.ships[0];
		var shipDefn = ship.defn(world);
		var safetyFactor = .9;
		var fuelRangeRadius =
			(shipGroup.fuel / shipGroup.fuelPerTick)
			 * shipDefn.speedMax
			 / hyperspace.size.x
			 * mapSize.x
			 * safetyFactor;
		display.drawCircle(drawPos, fuelRangeRadius, null, "Gray");
		*/
	}

	PlaceHyperspaceMap.prototype.updateForTimerTick_FromSuperclass = Place.prototype.draw;
	PlaceHyperspaceMap.prototype.updateForTimerTick = function(universe, world)
	{
		/*
		var inputHelper = universe.inputHelper;
		var inputsActive = inputHelper.inputsActive;
		for (var i = 0; i < inputsActive.length; i++)
		{
			var inputActive = inputsActive[i];
			if (inputActive == "Tab")
			{
				inputHelper.inputInactivate(inputActive);
				world.placeNext = this.placeHyperspaceToReturnTo;
			}
		}
		*/

		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var containerSize = universe.display.sizeInPixels.clone();
			var fontHeight = 20;
			var marginWidth = 10;
			var buttonSize = new Coords(25, 25);
			var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

			var titleSize = new Coords(containerSize.x, 25);

			var containerRightSize = new Coords
			(
				(containerSize.x - marginSize.x * 3) / 3,
				containerSize.y - marginSize.y * 3 - titleSize.y
			);

			var containerMapSize = new Coords
			(
				containerSize.x - marginSize.x * 3 - containerRightSize.x,
				containerRightSize.y
			);

			var controlRoot = new ControlContainer
			(
				"containerMain",
				new Coords(0, 0), // pos
				containerSize,
				[
					new ControlLabel
					(
						"labelHyperspaceMap",
						new Coords
						(
							containerSize.x / 2,
							marginSize.y + titleSize.y / 2
						),
						titleSize,
						true, // isTextCentered
						"Hyperspace Map",
						fontHeight
					),

					new ControlContainer
					(
						"containerMap",
						new Coords
						(
							marginSize.x,
							marginSize.y * 2 + titleSize.y
						),
						containerMapSize,
						// children
						[
							// todo
						]
					),

					new ControlContainer
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
							// todo
						]
					),

					new ControlButton
					(
						"buttonBack",
						marginSize,
						buttonSize,
						"<",
						fontHeight,
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							var world = universe.world;
							var place = world.place;
							var placeNext = place.placeHyperspaceToReturnTo;
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
}
