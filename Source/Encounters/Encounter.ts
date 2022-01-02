
class Encounter
{
	planet: Planet;
	factionName: string;
	entityPlayer: Entity;
	entityOther: Entity;
	placeToReturnTo: Place;
	posToReturnTo: Coords;
	doesEndInCombat: boolean

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

		this.doesEndInCombat = false;
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	fight(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var encounter = this;
		var displaySize = universe.display.sizeInPixels;
		var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 2);
		var player = world.player;
		var shipGroupOther = EntityExtensions.shipGroup(encounter.entityOther);
		var shipGroups = [player.shipGroup, shipGroupOther];
		var combat = new Combat(combatSize, encounter, shipGroups);

		world.placeNext = combat.toPlace(world);

		// These lines are necessary.
		var venueNext = new VenueWorld(world);
		universe.venueNext = venueNext;
	}

	goToPlaceNext(universe: Universe): void
	{
		if (this.doesEndInCombat)
		{
			this.fight(universe);
		}
		else
		{
			var placeNext = this.placeToReturnTo;
			var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
			var playerLoc = playerFromPlaceNext.locatable().loc;
			playerLoc.pos.overwriteWith(this.posToReturnTo);
			playerLoc.vel.clear();
			universe.world.placeNext = placeNext;
		}
	}

	posInHyperspace(): Coords
	{
		var returnPos: Coords = null;

		var place = this.placeToReturnTo;
		var placeTypeName = place.constructor.name;

		if (placeTypeName == PlaceHyperspace.name)
		{
			returnPos = place.player().locatable().loc.pos;
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
		var place = world.placeCurrent;

		var encounter = this;
		var faction = encounter.faction(world);
		var conversationDefnName = faction.conversationDefnName;
		var conversationResourceName = "Conversation-" + conversationDefnName;

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
}
