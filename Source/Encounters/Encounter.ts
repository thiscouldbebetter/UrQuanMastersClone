
class Encounter
{
	planet: Planet;
	factionName: string;
	entityOther: Entity;
	placeToReturnTo: Place;
	posToReturnTo: Coords;

	constructor
	(
		planet: Planet, factionName: string, entityOther: Entity,
		placeToReturnTo: Place, posToReturnTo: Coords
	)
	{
		this.planet = planet;
		this.factionName = factionName;
		this.entityOther = entityOther;
		this.placeToReturnTo = placeToReturnTo;
		this.posToReturnTo = posToReturnTo;
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	returnToPlace(world: World): void
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
