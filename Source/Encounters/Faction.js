
function Faction(name, nameOriginal, color, relationsWithPlayer, talksImmediately, conversationDefnName, sphereOfInfluence, shipDefnName, shipGroupActivity)
{
	this.name = name;
	this.nameOriginal = nameOriginal;
	this.color = color;
	this.relationsWithPlayer = relationsWithPlayer;
	this.talksImmediately = talksImmediately;
	this.conversationDefnName = conversationDefnName;
	this.sphereOfInfluence = sphereOfInfluence;
	this.shipDefnName = shipDefnName;
	this.shipGroupActivity = shipGroupActivity;
}
{
	Faction.RelationsAllied = "Allied";
	Faction.RelationsHostile = "Hostile";
	Faction.RelationsNeutral = "Neutral";
}
