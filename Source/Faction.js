
function Faction(name, color, relationsWithPlayer, talksImmediately, conversationDefnName, sphereOfInfluence, shipGroupActivity)
{
	this.name = name;
	this.color = color;
	this.relationsWithPlayer = relationsWithPlayer;
	this.talksImmediately = talksImmediately;
	this.conversationDefnName = conversationDefnName;
	this.sphereOfInfluence = sphereOfInfluence;
	this.shipGroupActivity = shipGroupActivity;
}
{
	Faction.RelationsAllied = "Allied";
	Faction.RelationsHostile = "Hostile";
	Faction.RelationsNeutral = "Neutral";

}
