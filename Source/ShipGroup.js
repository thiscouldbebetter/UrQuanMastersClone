
function ShipGroup(name, factionName, ships)
{
	this.name = name;
	this.factionName = factionName;
	this.ships = ships;
}
{
	ShipGroup.prototype.encounter = function(world, place, entityForShipGroup, entityPlayer)
	{
		entityForShipGroup.collidable.ticksUntilCanCollide = 50; // hack
		var encounter = new Encounter(this, place, entityPlayer.locatable.loc.pos);
		var placeEncounter = new PlaceEncounter(world, encounter);
		world.placeNext = placeEncounter;
	}

	ShipGroup.prototype.faction = function(world)
	{
		return world.defns.factions[this.factionName]
	}
}
