
class DiplomaticRelationship
{
	factionOtherName: string;
	relationshipTypeName: string;

	constructor(factionOtherName: string, relationshipTypeName: string)
	{
		this.factionOtherName = factionOtherName;
		this.relationshipTypeName = relationshipTypeName;
	}

	factionOther(world: WorldExtended): Faction
	{
		return world.factionByName(this.factionOtherName);
	}

	allianceEstablish(): DiplomaticRelationship
	{
		this.relationshipTypeName =
			DiplomaticRelationshipType.Instances().Allied.name;
		return this;
	}

	isAllied(): boolean
	{
		return (this.relationshipTypeName == DiplomaticRelationshipType.Instances().Allied.name);
	}

	isHostile(): boolean
	{
		return (this.relationshipTypeName == DiplomaticRelationshipType.Instances().Hostile.name);
	}
}

class DiplomaticRelationshipType
{
	name: string;

	constructor(name: string)
	{
		this.name = name;
	}

	static _instances: DiplomaticRelationshipType_Instances;
	static Instances(): DiplomaticRelationshipType_Instances
	{
		if (this._instances == null)
		{
			this._instances = new DiplomaticRelationshipType_Instances();
		}
		return this._instances;
	}

	static byName(name: string): DiplomaticRelationshipType
	{
		return this.Instances().byName(name);
	}
}

class DiplomaticRelationshipType_Instances
{
	Allied: DiplomaticRelationshipType;
	Hostile: DiplomaticRelationshipType;
	Neutral: DiplomaticRelationshipType;

	_All: DiplomaticRelationshipType[];

	constructor()
	{
		var dr = (name: string) => new DiplomaticRelationshipType(name);

		this.Allied = dr("Allied");
		this.Hostile = dr("Hostile");
		this.Neutral = dr("Neutral");

		this._All =
		[
			this.Allied,
			this.Hostile,
			this.Neutral
		];
	}

	byName(name: string): DiplomaticRelationshipType
	{
		return this._All.find(x => x.name == name);
	}
}