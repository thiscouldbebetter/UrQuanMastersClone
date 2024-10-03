
class StationDeprecated implements EntityProperty<StationDeprecated>, Satellite
{
	name: string;
	color: Color;
	radiusOuter: number;
	factionName: string;
	posAsPolar: Polar;

	constructor
	(
		name: string,
		color: Color,
		radiusOuter: number,
		factionName: string,
		posAsPolar: Polar
	)
	{
		this.name = name;
		this.color = color;
		this.radiusOuter = radiusOuter;
		this.factionName = factionName;
		this.posAsPolar = posAsPolar;
	}

	static fromEntity(entity: Entity): StationDeprecated
	{
		return entity.propertyByName(StationDeprecated.name) as StationDeprecated;
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	toEntity(world: WorldExtended, primary: Planet, primaryPos: Coords): Entity
	{
		var collider = new Sphere(Coords.fromXY(0, 0), this.radiusOuter);
		var collidable = Collidable.fromCollider(collider);

		var orbitColor = primary.orbitColor();

		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(this.posAsPolar.radius, null, orbitColor, null),
				primaryPos,
				null // ?
			),
			VisualRectangle.fromSizeAndColorFill
			(
				Coords.fromXY(1, 1).multiplyScalar(this.radiusOuter), this.color
			)
		]);
		var drawable = Drawable.fromVisual(visual);

		var pos = primaryPos.clone().add
		(
			this.posAsPolar.toCoords(Coords.create())
		);
		var locatable = new Locatable(Disposition.fromPos(pos));

		var faction = this.faction(world);
		var talker = faction.toTalker();

		var returnValue = new Entity
		(
			this.name,
			[
				collidable,
				drawable,
				locatable,
				this,
				talker
			]
		);

		return returnValue;
	}

	// Clonable.

	clone(): StationDeprecated
	{
		throw new Error("todo");
	}

	overwriteWith(other: StationDeprecated): StationDeprecated
	{
		throw new Error("todo");
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return StationDeprecated.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: StationDeprecated): boolean { return false; }

}
