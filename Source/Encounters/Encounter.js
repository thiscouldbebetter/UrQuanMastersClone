
class Encounter
{
	constructor(planet, factionName, entityOther, placeToReturnTo, posToReturnTo)
	{
		this.planet = planet;
		this.factionName = factionName;
		this.entityOther = entityOther;
		this.placeToReturnTo = placeToReturnTo;
		this.posToReturnTo = posToReturnTo;
	}

	faction(world)
	{
		return world.defn.factionByName(this.factionName);
	}

	returnToPlace(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
