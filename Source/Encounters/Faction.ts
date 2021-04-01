
class Faction extends EntityProperty
{
	name: string;
	nameOriginal: string;
	color: Color;
	relationsWithPlayer: string;
	talksImmediately: boolean;
	conversationDefnName: string;
	sphereOfInfluence: Sphere;
	shipDefnName: string;
	shipGroupActivity: Activity;

	constructor
	(
		name: string, nameOriginal: string, color: Color,
		relationsWithPlayer: string, talksImmediately: boolean,
		conversationDefnName: string, sphereOfInfluence: Sphere,
		shipDefnName: string, shipGroupActivity: Activity
	)
	{
		super();

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

	static RelationsAllied = "Allied";
	static RelationsHostile = "Hostile";
	static RelationsNeutral = "Neutral";
}
