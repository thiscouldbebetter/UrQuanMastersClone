
function Combat(size, encounter, shipGroups)
{
	this.size = size;
	this.encounter = encounter;
	this.shipGroups = shipGroups;
	this.shipsFighting = [];

	this._differenceOfWrapAndNoWrap	= new Coords();
	this._displacement = new Coords();
	this._displacementAbsolute = new Coords();
	this._displacementWrapped = new Coords();
	this._displacementWrappedAbsolute = new Coords();
	this._midpointBetweenPoints = new Coords();
}

{
	Combat.prototype.shipSelect = function(universe, shipSelected)
	{
		var combat = this;
		var world = universe.world;
		world.placeNext = new PlaceCombat(world, combat);
		var venueNext = new VenueWorld(world);
		universe.venueNext = venueNext;
	}

	// wrapping

	Combat.prototype.displacementOfPointsWrappedToRange = function(displacementToOverwrite, pos0, pos1, size)
	{
		var displacement = pos1.clone().subtract(pos0);
		var displacementMinSoFar = displacement.clone();
		var displacementMinSoFarAbsolute = displacementMinSoFar.clone().absolute();

		for (var i = -1; i <= 1; i += 2)
		{
			var displacementWrapped = size.clone().multiplyScalar(i).add(pos1).subtract(pos0);
			var displacementWrappedAbsolute = displacementWrapped.clone().absolute();
			if (displacementWrappedAbsolute.x < displacementMinSoFarAbsolute.x)
			{
				displacementMinSoFar.x = displacementWrapped.x;
				displacementMinSoFarAbsolute.x = displacementMinSoFarAbsolute.x;
			}
			if (displacementWrappedAbsolute.y < displacementMinSoFarAbsolute.y)
			{
				displacementMinSoFar.y = displacementWrapped.y;
				displacementMinSoFarAbsolute.y = displacementMinSoFarAbsolute.y;
			}
		}

		return displacementMinSoFar;
	}

	Combat.prototype.midpointOfPointsWrappedToRange = function(midpointToOverwrite, pos0, pos1, size)
	{
		var displacement = this.displacementOfPointsWrappedToRange(midpointToOverwrite, pos0, pos1, size);
		var midpoint = displacement.half().add(pos0);
		return midpoint;
	}

	// controls

	Combat.prototype.toControlShipSelect = function(universe, size)
	{
		var ships = this.shipGroups[0].ships;

		var returnValue = universe.controlBuilder.choiceList
		(
			universe,
			size,
			"Ship Select",
			ships,
			new DataBinding(null, "defnName"),
			"Fight", // buttonSelectText
			this.shipSelect.bind(this)
		);

		return returnValue;
	}

}
