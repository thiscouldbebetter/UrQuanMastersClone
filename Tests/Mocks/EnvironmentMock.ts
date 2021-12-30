
class EnvironmentMock
{
	universeBuild(): Universe
	{
		var timerHelper = new TimerHelper(0);
		var display = DisplayTest.default();
		var mediaLibrary = MediaLibrary.default();
		var controlBuilder = ControlBuilder.default();
		var worldCreator = new WorldCreator
		(
			(u: Universe, wc: WorldCreator) => WorldExtended.create(u),
			null,
			{
				"starsystemCountAsString": "12",
				"factionCountAsString": "2"
			} // settings
		);
		

		var universe = new Universe
		(
			"TestUniverse",
			"[version]",
			timerHelper,
			display,
			mediaLibrary,
			controlBuilder,
			worldCreator
		);

		universe.initialize(() => {});
		universe.soundHelper = new SoundHelperMock();

		var uwpe = UniverseWorldPlaceEntities.fromUniverse(universe);
		universe.worldCreate().initialize(uwpe);
		universe.updateForTimerTick();

		return universe;
	}
}
