function main()
{
	//localStorage.clear();

	var mediaLibrary = new MediaLibrary
	(
		// images
		[
			new Image("Conversation", "../Content/Images/Conversation.png"),
			new Image("Conversation-EarthStation", "../Content/Import/sc2/content/base/comm/commander/commander-000.png"),
			new Image("Conversation-Slaver", "../Content/Import/sc2/content/base/comm/urquan/urquan-000.png"),

			new Image("PlanetSurface", "../Content/Images/PlanetSurface.png"),
			new Image("Title", "../Content/Images/Title.png"),
		],
		// sounds
		[
			new Sound("Sound", "../Content/Audio/Effects/Sound.wav", false),
			new Sound("Music", "../Content/Audio/Music/Music.mp3", true),
		],
		// videos
		[
			new Video("Movie", "../Content/Video/Movie.webm"),
		],
		// fonts
		[
			new Font("Font", "../Content/Fonts/Font.ttf"),
		],
		// textStrings
		[
			//new TextString("Instructions", "../Content/Text/Instructions.txt"),
			new TextString("HyperspaceMap", "../Content/Import/sc2/src/uqm/plandata.c"),
			new TextString("Conversation-SlaverGuardDrone", "../Content/Text/Conversation-SlaverGuardDrone.json"),
			new TextString("Conversation-EarthStation", "../Content/Text/Conversation-EarthStation.json"),
		]
	);

	var displaySizeInPixelsDefault = new Coords(400, 300, 1);

	var display = new Display
	(
		// sizesAvailable
		[
			displaySizeInPixelsDefault,
			displaySizeInPixelsDefault.clone().half(),
			displaySizeInPixelsDefault.clone().multiplyScalar(2),
		],
		"Font", // fontName
		10, // fontHeightInPixels
		"Gray", "White" // colorFore, colorBack
	);

	var timerHelper = new TimerHelper(20);

	var universe = Universe.new
	(
		"SpaceAdventureClone", timerHelper, display, mediaLibrary, null
	);
	universe.initialize();

	if (universe.isDebuggingEnabled == true)
	{
		debug(universe);
	}
}

