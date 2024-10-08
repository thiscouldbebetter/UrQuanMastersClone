
class Faction implements EntityPropertyBase
{
	name: string;
	nameOriginal: string;
	color: Color;
	talksImmediately: boolean;
	conversationDefnName: string;
	territory: FactionTerritory;
	diplomaticRelationshipTypeWithPlayerDefault: DiplomaticRelationshipType;
	shipDefnName: string;
	shipGroupActivity: Activity;

	constructor
	(
		name: string,
		nameOriginal: string,
		color: Color,
		talksImmediately: boolean,
		conversationDefnName: string,
		territory: FactionTerritory,
		shipDefnName: string,
		diplomaticRelationshipTypeWithPlayerDefault: DiplomaticRelationshipType,
		shipGroupActivity: Activity
	)
	{
		this.name = name;
		this.nameOriginal = nameOriginal;
		this.color = color;
		this.talksImmediately = talksImmediately;
		this.conversationDefnName = conversationDefnName;
		this.territory = territory;
		this.shipDefnName = shipDefnName;
		this.diplomaticRelationshipTypeWithPlayerDefault =
			diplomaticRelationshipTypeWithPlayerDefault;
		this.shipGroupActivity = shipGroupActivity;
	}

	static fromEntity(entity: Entity): Faction
	{
		return entity.propertyByName(Faction.name) as Faction;
	}

	conversationDefnNameSet(value: string): Faction
	{
		this.conversationDefnName = value;
		return this;
	}

	diplomaticRelationshipDefaultBuild(): DiplomaticRelationship
	{
		return new DiplomaticRelationship
		(
			this.name,
			DiplomaticRelationshipType.Instances().Neutral.name
		);
	}

	shipDefn(world: WorldExtended): ShipDefn
	{
		var returnValue = world.shipDefnByName(this.shipDefnName);
		return returnValue;
	}

	shipGroupGenerateAtPos(pos: Coords): ShipGroup
	{
		var shipCount = 1; // todo
		var ships = new Array<Ship>();
		for (var i = 0; i < shipCount; i++)
		{
			var ship = Ship.fromDefnName(this.shipDefnName);
			ships.push(ship);
		}
		var shipGroup = ShipGroupFinite.fromFactionNameAndShips(this.name, ships).posSet(pos);
		return shipGroup;
	}

	starsystems(world: WorldExtended): Starsystem[]
	{
		// Tersely-named alias method.
		return this.starsystemsInTerritory(world);
	}

	starsystemsInTerritory(world: WorldExtended): Starsystem[]
	{
		var hyperspace = world.hyperspace;
		var territory = this.territory;
		var territoryShape = territory.shape;
		var starsystemsInTerritory =
			hyperspace.starsystems.filter
			(
				x => territoryShape.containsPoint(x.posInHyperspace)
			);
		return starsystemsInTerritory;
	}

	talkerToControl(cr: ConversationRun, size: Coords, universe: Universe): ControlBase
	{
		return cr.toControl_Layout_2(size, universe);
	}

	toEncounter(uwpe: UniverseWorldPlaceEntities): Encounter
	{
		var shipGroup = this.shipGroupGenerateAtPos(Coords.zeroes() );
		var encounter = shipGroup.toEncounter(uwpe);
		return encounter;
	}

	toTalker(): Talker
	{
		var talker = new Talker
		(
			this.conversationDefnName, null, this.talkerToControl
		);

		return talker;
	}


	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}

	initialize(uwpe: UniverseWorldPlaceEntities): void {}

	propertyName(): string { return Faction.name; }

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: Faction): boolean { return false; } 
}
