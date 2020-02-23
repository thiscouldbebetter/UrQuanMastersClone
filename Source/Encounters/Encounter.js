
function Encounter(planet, factionName, shipGroupOther, placeToReturnTo, posToReturnTo)
{
	this.planet = planet;
	this.factionName = factionName;
	this.shipGroupOther = shipGroupOther;
	this.placeToReturnTo = placeToReturnTo;
	this.posToReturnTo = posToReturnTo;
}
{
	Encounter.prototype.faction = function(world)
	{
		return world.defns.factions[this.factionName];
	}

	Encounter.prototype.returnToPlace = function(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entities["Player"];
		var playerLoc = playerFromPlaceNext.locatable.loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
