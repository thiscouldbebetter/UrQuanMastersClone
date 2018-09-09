
function Combat(size, encounter, shipGroups)
{
	this.size = size;
	this.encounter = encounter;
	this.shipGroups = shipGroups;
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
