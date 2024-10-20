
class EnergySource implements EntityProperty<EnergySource>
{
	name: string;
	pos: Coords;
	visual: VisualBase;
	itemDefn: ItemDefn;
	_collideWithLander: (uwpe: UniverseWorldPlaceEntities) => void;

	constructor
	(
		name: string,
		pos: Coords,
		visual: VisualBase,
		itemDefn: ItemDefn,
		collideWithLander: (uwpe: UniverseWorldPlaceEntities) => void
	)
	{
		this.name = name;
		this.pos = pos;
		this.visual = visual;
		this.itemDefn = itemDefn;
		this._collideWithLander = collideWithLander;
	}

	static _instances: EnergySource_Instances;
	static Instances(): EnergySource_Instances
	{
		if (this._instances == null)
		{
			this._instances = new EnergySource_Instances();
		}
		return this._instances;
	}

	static fromEntity(entity: Entity): EnergySource
	{
		return entity.propertyByName(EnergySource.name) as EnergySource;
	}

	toItemDefn(): ItemDefn
	{
		return this.itemDefn;
	}

	collideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		this._collideWithLander(uwpe);
	}

	toEntity(world: WorldExtended, planet: Planet): Entity
	{
		var dimension = 5;

		var collider = new Sphere(Coords.create(), dimension);
		var collidable = Collidable.fromCollider(collider);

		var visualDetailed = new VisualWrapped(planet.sizeSurface(), this.visual);
		var drawable = Drawable.fromVisual(visualDetailed);

		var item = Item.fromDefnName(this.name);

		var locatable = Locatable.fromPos(this.pos);

		var visualScanContact: VisualBase =
			VisualPolygon.fromVerticesAndColorFill
			(
				[
					Coords.fromXY(0, -dimension),
					Coords.fromXY(dimension, 0),
					Coords.fromXY(0, dimension),
					Coords.fromXY(-dimension, 0),
				],
				Color.Instances().Cyan
			);

		visualScanContact = new VisualHidable
		(
			this.toEntity_IsVisible,
			visualScanContact
		);

		var mappable = new Mappable(visualScanContact);

		var returnValue = new Entity
		(
			this.name,
			[
				collidable,
				drawable,
				this, // energySource
				item,
				locatable,
				mappable
			]
		);

		return returnValue;
	}

	toEntity_IsVisible(uwpe: UniverseWorldPlaceEntities): boolean
	{
		var isVisible = false;

		var place = uwpe.place;
		var placeTypeName = place.constructor.name;
		if (placeTypeName == PlacePlanetOrbit.name)
		{
			var placePlanetOrbit = place as PlacePlanetOrbit;
			isVisible = placePlanetOrbit.hasEnergyBeenScanned;
		}
		else if (placeTypeName == PlacePlanetSurface.name)
		{
			var placePlanetSurface = place as PlacePlanetSurface;
			var placePlanetOrbit = placePlanetSurface.placePlanetOrbit;
			isVisible = placePlanetOrbit.hasEnergyBeenScanned;
		}
		else
		{
			throw new Error("Unexpected placeTypeName: " + placeTypeName);
		}

		return isVisible;
	};

	// Clonable.
	clone(): EnergySource { throw new Error("todo"); }
	overwriteWith(other: EnergySource): EnergySource { throw new Error("todo"); }

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return EnergySource.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: EnergySource): boolean { return false; }
}

class EnergySource_Instances
{
	AbandonedMoonbase: EnergySource;
	CrashedShackler: EnergySource;
	MauluskaOrphan: EnergySource;
	TtorstingCaster: EnergySource;

	_All: EnergySource[];

	constructor()
	{
		var es = EnergySource;
		var posNone: Coords = null;
		var itemDefnNone: ItemDefn = null;

		var vifl = VisualImageFromLibrary;

		this.AbandonedMoonbase 	= new es(
			"AbandonedMoonbase",
			posNone,
			new vifl(EnergySource.name + "AbandonedMoonbase"),
			itemDefnNone,
			this.abandonedMoonbase_CollideWithLander
		);

		this.CrashedShackler = new es
		(
			"CrashedShackler",
			posNone,
			new vifl(EnergySource.name + "CrashedShackler"),
			this.crashedShackler_ItemDefn(),
			this.crashedShackler_CollideWithLander
		);

		this.MauluskaOrphan = new es
		(
			"MauluskaOrphan",
			posNone,
			new vifl(EnergySource.name + "MauluskaOrphan"),
			itemDefnNone,
			this.mauluskaOrphan_CollideWithLander
		);

		this.TtorstingCaster = new es
		(
			"TtorstingCaster",
			posNone,
			new vifl(EnergySource.name + "TtorstingCaster"),
			this.ttorstingCaster_ItemDefn(),
			this.ttorstingCaster_CollideWithLander
		);

		this._All =
		[
			this.AbandonedMoonbase,
			this.CrashedShackler,
			this.MauluskaOrphan,
			this.TtorstingCaster
		];
	}

	abandonedMoonbase_CollideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;

		var acknowledgeReport = () =>
		{
			var place = uwpe.place as PlacePlanetSurface;
			place.exit(uwpe);
		};

		var venueToReturnTo = universe.venueCurrent();

		var mediaLibrary = universe.mediaLibrary;
		var abandonedMoonbaseMessage =
			mediaLibrary.textStringGetByName(EnergySource.name + "AbandonedMoonbase").value;

		var venueMessage =
			VenueMessage.fromTextAcknowledgeAndVenuePrev(abandonedMoonbaseMessage, acknowledgeReport, venueToReturnTo);

		universe.venueTransitionTo(venueMessage);
	}

	crashedShackler_CollideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		const textCrashedShackler = "CrashedShackler";

		var universe = uwpe.universe;

		var acknowledgeReport = (uwpe: UniverseWorldPlaceEntities) =>
		{
			var place = uwpe.place as PlacePlanetSurface;
			var entityPlayer = place.entityByName(Player.name);
			var lander = Lander.fromEntity(entityPlayer);
			var entityEnergySource = place.entityByName(textCrashedShackler);
			lander.itemHolderDevices.itemEntityPickUpFromPlace(entityEnergySource, place);
			place.exit(uwpe);
		};

		var venueToReturnTo = universe.venueCurrent();

		var mediaLibrary = universe.mediaLibrary;
		var message =
			mediaLibrary.textStringGetByName(EnergySource.name + textCrashedShackler).value;

		var venueMessage =
			VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);

		universe.venueTransitionTo(venueMessage);
	}

	crashedShackler_ItemDefn(): ItemDefn
	{
		return ItemDefn.fromName
		(
			"CrashedShackler"
		);
	}

	mauluskaOrphan_CollideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		const textMauluskaOrphan = "MauluskaOrphan";

		var universe = uwpe.universe;

		var acknowledgeReport = (uwpe: UniverseWorldPlaceEntities) =>
		{
			var place = uwpe.place as PlacePlanetSurface;
			var entityPlayer = place.entityByName(Player.name);
			// var lander = Lander.fromEntity(entityPlayer);
			// var entityEnergySource = place.entityByName(textMauluskaOrphan);
			// todo - Remove the ship from the planet surface.
			place.exit(uwpe);

			var world = uwpe.world as WorldExtended;
			const textMauluska = "Mauluska";
			var factionMauluska = world.factionByName(textMauluska);
			uwpe
				.placeSet( (place as PlacePlanetSurface).placePlanetOrbit)
				.entitySet(entityPlayer)
				// .entity2Set(entityEnergySource); // This makes the talking fail.
			var encounter = factionMauluska.toEncounter(uwpe);
			var placeEncounter = encounter.toPlace();
			world.placeNextSet(placeEncounter);
		};

		var venueToReturnTo = universe.venueCurrent();

		var mediaLibrary = universe.mediaLibrary;
		var message =
			mediaLibrary.textStringGetByName(EnergySource.name + textMauluskaOrphan).value;

		var venueMessage =
			VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);

		universe.venueTransitionTo(venueMessage);
	}

	ttorstingCaster_CollideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		const textTtorstingCaster = "TtorstingCaster";

		var universe = uwpe.universe;

		var acknowledgeReport = (uwpe: UniverseWorldPlaceEntities) =>
		{
			var place = uwpe.place as PlacePlanetSurface;
			var entityPlayer = place.entityByName(Player.name);
			var lander = Lander.fromEntity(entityPlayer);
			var entityEnergySource = place.entityByName(textTtorstingCaster);
			lander.itemHolderDevices.itemEntityPickUpFromPlace(entityEnergySource, place);
			place.exit(uwpe);
		};

		var venueToReturnTo = universe.venueCurrent();

		var mediaLibrary = universe.mediaLibrary;
		var message =
			mediaLibrary.textStringGetByName(EnergySource.name + textTtorstingCaster).value;

		var venueMessage =
			VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);

		universe.venueTransitionTo(venueMessage);
	}

	ttorstingCaster_ItemDefn(): ItemDefn
	{
		return ItemDefn.fromNameAndUse
		(
			"TtorstingCaster", this.ttorstingCaster_Use
		);
	}

	ttorstingCaster_Use(uwpe: UniverseWorldPlaceEntities): string
	{
		var world = uwpe.world as WorldExtended;
		var place = world.place();
		var placeTypeName = place.constructor.name;
		if (placeTypeName == PlaceHyperspace.name)
		{
			var placeHyperspace = place as PlaceHyperspace;
			var factionMurch = world.factionByName("Murch");
			var shipGroupDistance = 20; // hack
			var shipGroupDisplacement =
				Polar.random2D().radiusSet(shipGroupDistance).toCoords(Coords.create());
			var player = placeHyperspace.player();
			var playerPos = player.locatable().pos();
			var shipGroupPos = shipGroupDisplacement.add(playerPos);
			var shipGroupMurch = factionMurch.shipGroupGenerateAtPos(shipGroupPos);
			placeHyperspace.shipGroupAdd(shipGroupMurch, world);
		}
		return null;
	}

}