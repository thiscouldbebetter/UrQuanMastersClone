
class EnergySource implements EntityProperty<EnergySource>
{
	name: string;
	pos: Coords;
	visual: VisualBase;
	_collideWithLander: (uwpe: UniverseWorldPlaceEntities) => void;

	constructor
	(
		name: string,
		pos: Coords,
		visual: VisualBase,
		collideWithLander: (uwpe: UniverseWorldPlaceEntities) => void
	)
	{
		this.name = name;
		this.pos = pos;
		this.visual = visual;
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

	collideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		this._collideWithLander(uwpe);
	}

	toEntity(world: WorldExtended, planet: Planet): Entity
	{
		var dimension = 5;

		var energySourceCollider = new Sphere(Coords.create(), dimension);
		var energySourceCollidable = Collidable.fromCollider(energySourceCollider);

		var visualDetailed = new VisualWrapped(planet.sizeSurface, this.visual);
		var energySourceDrawable = Drawable.fromVisual(visualDetailed);

		var energySourceLocatable = Locatable.fromPos(this.pos);

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
			(uwpe: UniverseWorldPlaceEntities) =>
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
			},
			visualScanContact
		);
		var energySourceMappable = new Mappable(visualScanContact);

		var returnValue = new Entity
		(
			this.name,
			[
				energySourceCollidable,
				energySourceDrawable,
				this,
				energySourceLocatable,
				energySourceMappable
			]
		);

		return returnValue;
	}

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
		var pos: Coords = null;
		var visual = new VisualNone(); // todo
		var collideWithLander = (uwpe: UniverseWorldPlaceEntities) => { throw new Error("todo") };

		var vifl = VisualImageFromLibrary;

		this.AbandonedMoonbase 	= new es(
			"AbandonedMoonbase",
			pos,
			new vifl(EnergySource.name + "AbandonedMoonbase"),
			this.abandonedMoonbase_CollideWithLander
		);
		this.CrashedShackler 	= new es("CrashedShackler", pos, visual, collideWithLander);
		this.MauluskaOrphan 	= new es("MauluskaOrphan", pos, visual, collideWithLander);
		this.TtorstingCaster 	= new es
		(
			"TtorstingCaster",
			pos,
			new vifl(EnergySource.name + "TtorstingCaster"),
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

	ttorstingCaster_CollideWithLander(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;

		var acknowledgeReport = (uwpe: UniverseWorldPlaceEntities) =>
		{
			var place = uwpe.place as PlacePlanetSurface;
			var entityPlayer = place.entityByName(Player.name);
			var lander = Lander.fromEntity(entityPlayer);
			var entityEnergySource = uwpe.universe.world.place().entityByName("TtorstingCaster");
			lander.itemHolderCargo.itemEntityPickUpFromPlace(entityEnergySource, place);
			place.exit(uwpe);
		};

		var venueToReturnTo = universe.venueCurrent();

		var mediaLibrary = universe.mediaLibrary;
		var message =
			mediaLibrary.textStringGetByName(EnergySource.name + "TtorstingCaster").value;

		var venueMessage =
			VenueMessage.fromTextAcknowledgeAndVenuePrev(message, acknowledgeReport, venueToReturnTo);

		universe.venueTransitionTo(venueMessage);
	}

}