
class Faction implements EntityPropertyBase
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

	starsystems(world: WorldExtended): Starsystem[]
	{
		// Tersely-named alias method.
		return this.starsystemsInSphereOfInfluence(world);
	}

	starsystemsInSphereOfInfluence(world: WorldExtended): Starsystem[]
	{
		var hyperspace = world.hyperspace;
		var sphere = this.sphereOfInfluence;
		var starsystemsInSphereOfInfluence =
			hyperspace.starsystems.filter(x => sphere.containsPoint(x.posInHyperspace));
		return starsystemsInSphereOfInfluence;
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}

	initialize(uwpe: UniverseWorldPlaceEntities): void {}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: Faction): boolean { return false; } 
}
