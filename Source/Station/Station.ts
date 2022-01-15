
class Station implements EntityProperty<Station>, Satellite
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

	static fromEntity(entity: Entity): Station
	{
		return entity.propertyByName(Station.name) as Station;
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	toEntity(primaryPos: Coords): Entity
	{
		var collider = new Sphere(Coords.fromXY(0, 0), this.radiusOuter);
		var collidable = Collidable.fromCollider(collider)

		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(this.posAsPolar.radius, null, Color.byName("Gray"), null),
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

		var talker = new Talker
		(
			"Conversation-" + this.name, null, this.toControl
		);

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

	// Controls.

	toControl(cr: ConversationRun, size: Coords, universe: Universe): ControlBase
	{
		return cr.toControl_Layout_2(size, universe)
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: Station): boolean { return false; }

}
