
class LinkPortal implements EntityProperty<LinkPortal>
{
	name: string;
	posInSpace: Coords;
	destinationSpaceName: string;
	destinationPos: Coords;

	constructor
	(
		name: string,
		posInSpace: Coords,
		destinationSpaceName: string,
		destinationPos: Coords
	)
	{
		this.name = name;
		this.posInSpace = posInSpace;
		this.destinationSpaceName = destinationSpaceName;
		this.destinationPos = destinationPos;
	}

	static fromEntity(entity: Entity): LinkPortal
	{
		return entity.propertyByName(LinkPortal.name) as LinkPortal;
	}

	collideWithPlayer(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;
		if (LinkPortal.fromEntity(uwpe.entity2) == null)
		{
			uwpe.entitiesSwap();
		}
		var entityPlayer = uwpe.entity;
		var entityLinkPortal = uwpe.entity2;

		var linkPortal = LinkPortal.fromEntity(entityLinkPortal);

		var spaceBeingEntered = linkPortal.destinationSpace(world);
		var playerLoc = entityPlayer.locatable().loc;
		var playerPosNext = linkPortal.destinationPos.clone();
		var playerDisposition = Disposition.fromPosOrientationAndPlaceName
		(
			playerPosNext,
			playerLoc.orientation.clone(),
			spaceBeingEntered.name
		);

		var placeHyperspace = new PlaceHyperspace
		(
			universe,
			spaceBeingEntered,
			null, // starsystemDeparted
			playerDisposition
		);

		world.placeNextSet(placeHyperspace);
	}

	destinationSpace(world: WorldExtended): Hyperspace
	{
		var destinationSpace =
			(this.destinationSpaceName == "Paraspace")
			? world.paraspace
			: world.hyperspace;

		return destinationSpace;
	}

	toEntity(radiusInHyperspace: number): Entity
	{
		var collider = Sphere.fromRadius(radiusInHyperspace);
		var collidable = Collidable.from3 // todo
		(
			collider,
			[],
			null // this.collideWithPlayer
		);
		var boundable = Boundable.fromCollidable(collidable);

		var color = Color.Instances().Red; // todo
		var visual = VisualCircle.fromRadiusAndColorFill(radiusInHyperspace, color);
		var drawable = Drawable.fromVisual(visual);

		var locatable = Locatable.fromPos(this.posInSpace);

		var entity = new Entity
		(
			this.name,
			[
				boundable,
				collidable,
				drawable,
				this,
				locatable
			]
		);

		return entity;
	}

	// Clonable.

	clone(): LinkPortal
	{
		throw new Error("todo");
	}

	overwriteWith(other: LinkPortal): LinkPortal
	{
		throw new Error("todo");
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return LinkPortal.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.
	equals(other: LinkPortal): boolean { return false; }
}
