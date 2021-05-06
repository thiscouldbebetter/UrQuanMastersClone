
class Faction implements EntityProperty
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

	// EntityProperty.

	finalize(u: Universe, w: World, p: Place, e: Entity): void {}

	initialize(u: Universe, w: World, p: Place, e: Entity): void {}

	updateForTimerTick(u: Universe, w: World, p: Place, e: Entity): void {}
}
