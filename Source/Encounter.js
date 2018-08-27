
function Encounter(shipGroupOther, placeToReturnTo, posToReturnTo)
{
	this.shipGroupOther = shipGroupOther;
	this.placeToReturnTo = placeToReturnTo;
	this.posToReturnTo = posToReturnTo;
}
{
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
