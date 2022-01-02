
class PlaceEncounter extends Place
{
	encounter: Encounter;

	venueControls: VenueControls;

	constructor(world: World, encounter: Encounter)
	{
		super
		(
			PlaceEncounter.name,
			PlaceEncounter.name,
			null, // parentName
			null, // size
			null // entities
		);

		this.encounter = encounter;
	}

	// Place

	draw(universe: Universe, world: World)
	{
		//super.draw(universe, world);
		if (this.venueControls != null)
		{
			this.venueControls.draw(universe);
		}
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;

		super.updateForTimerTick(uwpe);

		if (this.venueControls == null)
		{
			var encounter = this.encounter;

			var factionName = encounter.factionName;
			var world = uwpe.world as WorldExtended;
			var worldDefn = world.defnExtended();
			var faction = worldDefn.factionByName(factionName);

			if (faction.talksImmediately)
			{
				this.encounter.talk(universe);
				return; // hack
			}

			var shipGroupOther =
				EntityExtensions.shipGroup(encounter.entityOther);
			var shipGroupOtherDescription =
				shipGroupOther.toStringDescription();

			var newline = "\n";
			var messageToShow =
				"Encounter" + newline
				+ "with " + shipGroupOtherDescription + newline
				+ "near " + encounter.planet.name;

			var choiceNames = [ "Talk" ];
			var choiceActions = [ () => this.encounter.talk(universe) ];

			if (faction.relationsWithPlayer == Faction.RelationsHostile)
			{
				choiceNames.push("Fight");
				choiceActions.push( () => this.encounter.fight(universe) );
			}

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				DataBinding.fromContext(messageToShow),
				choiceNames,
				choiceActions,
				null // ?
			);

			this.venueControls = VenueControls.fromControl(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe);
	}
}
