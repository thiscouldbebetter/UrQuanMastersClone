
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

		var factionsKnownNames = world.player.factionsKnownNames;
		var factions = world.defns.factions;
		for (var i = 0; i < factionsKnownNames.length; i++)
		{
			var factionName = factionsKnownNames[i];
			var faction = factions[factionName];
			var factionZone = faction.sphereOfInfluence;

			if (factionZone != null)
			{

				drawPos.overwriteWith
				(
					factionZone.center
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

				var factionZoneRadiusScaled = factionZone.radius / hyperspaceSize.x * mapSize.x;

				var factionColor = faction.color;
				display.drawCircle(drawPos, factionZoneRadiusScaled, null, factionColor);

				display.drawText
				(
					faction.name,
					10, //fontHeightInPixels,
					drawPos,
					factionColor,
					"Gray",
					false, // areColorsReversed,
					true, // isCentered,
					null, // widthMaxInPixels
				);
			}
		}

		/*
		var shipGroup = entityForPlayer.shipGroup;
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

		var entityForPlayer =
			this.placeHyperspaceToReturnTo.entitiesByPropertyName("playable")[0];
		var playerPos = entityForPlayer.locatable.loc.pos;
		drawPos.overwriteWith(playerPos).divide(hyperspaceSize).multiply(mapSize).add(mapPos);
		var locatorDimension = starRadius * 8;
		var locatorSize = new Coords(1, 1).multiplyScalar(locatorDimension);
		display.drawRectangleCentered(drawPos, locatorSize, null, "Gray");

		if (this.reticlePos == null)
		{
			this.reticlePos = playerPos.clone();
		}

		var reticleRadius = locatorDimension * 2;

		drawPos.overwriteWith
		(
			this.reticlePos
		).divide(hyperspaceSize).multiply(mapSize).add(mapPos);
		display.drawCrosshairs(drawPos, reticleRadius, "Gray");

	}

	PlaceHyperspaceMap.prototype.updateForTimerTick_FromSuperclass = Place.prototype.draw;
	PlaceHyperspaceMap.prototype.updateForTimerTick = function(universe, world)
	{
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

		var inputHelper = universe.inputHelper;
		var inputsActive = inputHelper.inputsActive;
		for (var i = 0; i < inputsActive.length; i++)
		{
			var inputActive = inputsActive[i];
			if (inputActive.startsWith("Arrow"))
			{
				var directionToMove;
				if (inputActive.endsWith("Down"))
				{
					directionToMove = new Coords(0, 1);
				}
				else if (inputActive.endsWith("Left"))
				{
					directionToMove = new Coords(-1, 0);
				}
				else if (inputActive.endsWith("Right"))
				{
					directionToMove = new Coords(1, 0);
				}
				else if (inputActive.endsWith("Up"))
				{
					directionToMove = new Coords(0, -1);
				}
				directionToMove.multiplyScalar(32);
				this.reticlePos.add(directionToMove);
			}
			else if (inputActive == "PageDown")
			{
				// todo
			}
			else if (inputActive == "PageUp")
			{
				// todo
			}
		}
	}
}
