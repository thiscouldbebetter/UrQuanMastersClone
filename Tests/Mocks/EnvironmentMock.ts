
class EnvironmentMock
{
	universeBuild(callback: (u: Universe) => void): void
	{
		var contentDirectoryPath = "../../../Content/";
		var mediaLibrary = new Game().mediaLibraryBuild(contentDirectoryPath);
		mediaLibrary.waitForItemsAllToLoad
		(
			() => this.universeBuild_MediaLibraryLoaded(mediaLibrary, callback)
		);
	}

	universeBuild_MediaLibraryLoaded
	(
		mediaLibrary: MediaLibrary,
		callback: (u: Universe) => void
	): void
	{
		var timerHelper = new TimerHelper(0);
		var display = DisplayTest.default();

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
			mediaLibrary,
			controlBuilder,
			worldCreator
		);

		universe.initialize(() => {});
		universe.soundHelper = new SoundHelperMock();

		var uwpe = UniverseWorldPlaceEntities.fromUniverse(universe);
		universe.worldCreate().initialize(uwpe);
		universe.updateForTimerTick();

		callback(universe);
	}
}
