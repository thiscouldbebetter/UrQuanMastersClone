
class LinkPortal implements EntityProperty<LinkPortal>
{
	name: string;
	posInSpace: Coords;
	destinationPlaceName: string;
	destinationPos: Coords;

	constructor
	(
		name: string,
		posInSpace: Coords,
		destinationPlaceName: string,
		destinationPos: Coords
	)
	{
		this.name = name;
		this.posInSpace = posInSpace;
		this.destinationPlaceName = destinationPlaceName;
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
		var place = world.place();
		if (LinkPortal.fromEntity(uwpe.entity2) == null)
		{
			uwpe.entitiesSwap();
		}
		var entityPlayer = uwpe.entity;
		var entityLinkPortal = uwpe.entity2;

		var linkPortal = LinkPortal.fromEntity(entityLinkPortal);

		var placeNext: Place;

		if (this.destinationPlaceName.endsWith("space") )
		{
			var spaceBeingEntered =
				this.destinationPlaceName.startsWith("Hyper")
				? world.hyperspace
				: world.paraspace;

			var playerLoc = entityPlayer.locatable().loc;
			var playerPosNext = linkPortal.destinationPos.clone();
			var playerDisposition = Disposition.fromPosOrientationAndPlaceName
			(
				playerPosNext,
				playerLoc.orientation.clone(),
				spaceBeingEntered.name
			);

			placeNext = new PlaceHyperspace
			(
				universe,
				spaceBeingEntered,
				null, // starsystemDeparted
				playerDisposition
			);
		}
		else if (this.destinationPlaceName.startsWith(Encounter.name) )
		{
			var factionName = this.destinationPlaceName.split("-")[1];
			var playerPos = entityPlayer.locatable().loc.pos;
			var encounter = new Encounter
			(
				null, // planet
				factionName,
				entityPlayer,
				entityLinkPortal,
				place, // placeToReturnTo
				playerPos
			);
			var placeEncounter = encounter.toPlace();
			world.placeNextSet(placeEncounter);
		}
		else
		{
			throw new Error("Unrecognized value in .destinationPlaceName.");
		}

		world.placeNextSet(placeNext);
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
