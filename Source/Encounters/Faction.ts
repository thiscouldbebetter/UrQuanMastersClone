
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
		name: string,
		nameOriginal: string,
		color: Color,
		relationsWithPlayer: string,
		talksImmediately: boolean,
		conversationDefnName: string,
		sphereOfInfluence: Sphere,
		shipDefnName: string,
		shipGroupActivity: Activity
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

	static fromEntity(entity: Entity): Faction
	{
		return entity.propertyByName(Faction.name) as Faction;
	}

	shipDefn(world: WorldExtended): ShipDefn
	{
		var returnValue = world.shipDefnByName(this.shipDefnName);
		return returnValue;
	}

	shipGroup(): ShipGroup
	{
		return this.shipGroupGenerate();
	}

	shipGroupGenerate(): ShipGroup
	{
		var shipCount = 1; // todo
		var ships = new Array<Ship>();
		for (var i = 0; i < shipCount; i++)
		{
			var ship = Ship.fromDefnName(this.shipDefnName);
			ships.push(ship);
		}
		var shipGroup = ShipGroup.fromFactionNameAndShips(this.name, ships);
		return shipGroup;
	}

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

	propertyName(): string { return Faction.name; }

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: Faction): boolean { return false; } 
}
