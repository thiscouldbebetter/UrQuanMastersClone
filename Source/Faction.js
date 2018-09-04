
function Faction(name, relationsWithPlayer, talksImmediately, conversationDefnName, shipGroupActivity)
{
	this.name = name;
	this.relationsWithPlayer = relationsWithPlayer;
	this.talksImmediately = talksImmediately;
	this.conversationDefnName = conversationDefnName;
	this.shipGroupActivity = shipGroupActivity;
}
{
	Faction.RelationsAllied = "Allied";
	Faction.RelationsHostile = "Hostile";
	Faction.RelationsNeutral = "Neutral";
	
}
