
class Encounter
{
	planet: Planet;
	factionName: string;
	entityPlayer: Entity;
	entityOther: Entity;
	placeToReturnTo: Place;
	posToReturnTo: Coords;

	endsInCombat: boolean

	constructor
	(
		planet: Planet,
		factionName: string,
		entityPlayer: Entity,
		entityOther: Entity,
		placeToReturnTo: Place,
		posToReturnTo: Coords
	)
	{
		this.planet = planet;
		this.factionName = factionName;
		this.entityPlayer = entityPlayer;
		this.entityOther = entityOther;
		this.placeToReturnTo = placeToReturnTo;
		this.posToReturnTo = posToReturnTo;

		this.endsInCombatSet(false);
	}

	endsInCombatSet(value: boolean): Encounter
	{
		this.endsInCombat = value;
		return this;
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	fight(universe: Universe): void
	{
		this.endsInCombatSet(true);

		var world = universe.world as WorldExtended;
		var encounter = this;
		var displaySize = universe.display.sizeInPixels;
		var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 4);
		var player = world.player;
		var shipGroupOther = ShipGroupBase.fromEntity(encounter.entityOther);
		var shipGroups = [player.shipGroup, shipGroupOther];
		var combat = new Combat(combatSize, encounter, shipGroups);

		world.placeNextSet(combat.toPlace(world) );

		// These lines are necessary.
		var venueNext = new VenueWorld(world);
		universe.venueNextSet(venueNext);
	}

	goToPlaceNext(universe: Universe): void
	{
		if (this.endsInCombat)
		{
			this.fight(universe);
		}
		else
		{
			var world = universe.world;
			var placeNext =
				world.placeNext || this.placeToReturnTo;
			var playerFromPlaceNext = placeNext.entityByName(Player.name);
			if (playerFromPlaceNext != null)
			{
				var playerLoc = playerFromPlaceNext.locatable().loc;
				playerLoc.pos.overwriteWith(this.posToReturnTo);
				playerLoc.vel.clear();
			}
			world.placeNextSet(placeNext);
			universe.venueNextSet(world.toVenue() );
		}
	}

	placeToReturnToSet(value: Place): Encounter
	{
		this.placeToReturnTo = value;
		return this;
	}

	posInHyperspace(): Coords
	{
		var returnPos: Coords = null;

		var place = this.placeToReturnTo;
		var placeTypeName = place.constructor.name;

		if (placeTypeName == PlaceHyperspace.name)
		{
			returnPos = (place as PlaceBase).player().locatable().loc.pos;
		}
		else if (placeTypeName == PlaceStarsystem.name)
		{
			//var starsystem = (place as PlaceStarsystem).starsystem();
			throw new Error("Unexpected placeTypeName: " + placeTypeName);
		}
		else if (placeTypeName == PlacePlanetVicinity.name)
		{
			//var starsystem = (place as PlacePlanetVicinity).starsystem();
			throw new Error("Unexpected placeTypeName: " + placeTypeName);
		}
		else
		{
			throw new Error("Unexpected placeTypeName: " + placeTypeName);
		}

		return returnPos;
	}

	talk(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var place = world.place();

		var encounter = this;
		var faction = encounter.faction(world);
		var conversationDefnName = faction.conversationDefnName;
		var conversationResourceName = conversationDefnName;

		var conversationQuit = () =>
		{
			encounter.goToPlaceNext(universe);
		};

		var entityPlayer = encounter.entityPlayer;
		var entityTalker = encounter.entityOther;
		var talker = entityTalker.talker();
		talker.conversationDefnName = conversationResourceName;
		talker.quit = conversationQuit;
		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, entityTalker, entityPlayer);
		talker.talk(uwpe);
	}

	toPlace(): PlaceEncounter
	{
		return new PlaceEncounter(this);
	}
}
