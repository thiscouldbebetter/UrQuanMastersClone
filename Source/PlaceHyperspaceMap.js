
function PlaceHyperspaceMap(placeHyperspaceToReturnTo)
{
	this.placeHyperspaceToReturnTo = placeHyperspaceToReturnTo;

	this._drawPos = new Coords();
}
{
	PlaceHyperspaceMap.prototype = Object.create(Place.prototype);
	PlaceHyperspaceMap.prototype.constructor = Place;

	PlaceHyperspaceMap.prototype.draw_FromSuperclass = PlaceHyperspace.prototype.draw;
	PlaceHyperspaceMap.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var hyperspace = this.placeHyperspaceToReturnTo.hyperspace;
		var hyperspaceSize = hyperspace.size;
		var displaySize = display.sizeInPixels;
		var mapSize = new Coords(displaySize.y, displaySize.y);

		display.drawRectangle(Coords.Instances.Zeroes, mapSize, "Black", "Gray");

		var drawPos = this._drawPos;
		var starRadius = 2;
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
			);

			display.drawCircle(drawPos, starRadius, starColor);
		}

		var entityForPlayer = 
			this.placeHyperspaceToReturnTo.entitiesByPropertyName("playable")[0];
		var playerPos = entityForPlayer.locatable.loc.pos;
		drawPos.overwriteWith(playerPos).divide(hyperspaceSize).multiply(mapSize);
		var reticleSize = new Coords(1, 1).multiplyScalar(starRadius * 4);
		display.drawRectangleCentered(drawPos, reticleSize, null, "Gray");

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
	}

	PlaceHyperspaceMap.prototype.updateForTimerTick_FromSuperclass = Place.prototype.draw;
	PlaceHyperspaceMap.prototype.updateForTimerTick = function(universe, world)
	{
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
	}

}
