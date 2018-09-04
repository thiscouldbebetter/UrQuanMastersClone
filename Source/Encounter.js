
function Encounter(shipGroupOther, placeToReturnTo, posToReturnTo)
{
	this.shipGroupOther = shipGroupOther;
	this.placeToReturnTo = placeToReturnTo;
	this.posToReturnTo = posToReturnTo;
}
{
	Encounter.create = function(world, place, entityForShipGroup, entityPlayer)
	{
		entityForShipGroup.collidable.ticksUntilCanCollide = 50; // hack
		var shipGroup = entityForShipGroup.modellable.model;
		var encounter = new Encounter
		(
			shipGroup, place, entityPlayer.locatable.loc.pos
		);
		var placeEncounter = new PlaceEncounter(world, encounter);
		world.placeNext = placeEncounter;
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
