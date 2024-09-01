
class EnvironmentMock
{
	/*
	universeBuild(callback: (u: Universe) => void): void
	{
		var contentDirectoryPath = "../../../Content/";
		var mediaLibrary = new Game().mediaLibraryBuild(contentDirectoryPath);
		mediaLibrary.waitForItemsAllToLoad
		(
			() => this.universeBuild_MediaLibraryLoaded(mediaLibrary, callback)
		);
	}
	*/

	universeBuild//_MediaLibraryLoaded
	(
		callback: (u: Universe) => void
	): void
	{
		var timerHelper = new TimerHelper(25);
		timerHelper.ticksSoFar = 0; // hack

		var display = DisplayTest.default();
		var soundHelper = new SoundHelperMock();

		var contentDirectoryPath = "../../../../Content/";
		var mediaLibrary = new Game().mediaLibraryBuild(contentDirectoryPath);

		var controlBuilder = ControlBuilder.default();
		var worldCreator = new WorldCreator
		(
			(u: Universe, wc: WorldCreator) => WorldExtended.create(u),
			null, // ?
			{
				// todo
			} // settings
		);

		var universe = new Universe
		(
			"TestUniverse",
			"[version]",
			timerHelper,
			display,
			soundHelper,
			mediaLibrary,
			controlBuilder,
			worldCreator
		);


		universe.initialize
		(
			() =>
			{
				var uwpe = UniverseWorldPlaceEntities.fromUniverse(universe);
				universe.worldCreate().initialize(uwpe);
				universe.updateForTimerTick();

				callback(universe);
			}
		);

	}
}
