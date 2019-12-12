function main()
{
	//localStorage.clear();

	var contentPathPrefixComms = "../Content/Import/sc2/content/base/comm/"

	var conversationPlaceholderPath = "../Content/Text/Conversation-Placeholder.json";

	var imageDirectory = "../Content/Images/";

	var mediaLibrary = new MediaLibrary
	(
		// images
		[
			new Image("Conversation", imageDirectory + "Conversation.png"),
			new Image("Conversation-EarthStation", "../Content/Import/sc2/content/base/comm/commander/commander-000.png"),
			new Image("Conversation-Lahkemup", "../Content/Import/sc2/content/base/comm/urquan/urquan-000.png"),

			new Image("PlanetSurface", imageDirectory + "PlanetSurface.png"),
			new Image("Title", imageDirectory + "Title.png"),

			// slides
			new Image("Black", imageDirectory + "/Slides/Black-1x1px.png"),
			new Image("Red", imageDirectory + "Slides/Red-1x1px.png"),
			new Image("Cyan", imageDirectory + "Slides/Cyan-1x1px.png"),
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
			new TextString("StarsAndPlanets", "../Content/Text/PlanetDatabase.csv"),

			new TextString("Conversation-LahkemupGuardDrone", "../Content/Text/Conversation-LahkemupGuardDrone.json"),
			new TextString("Conversation-Lahkemup-Content", contentPathPrefixComms + "urquan/urquan.txt"),
			new TextString("Conversation-EarthStation", "../Content/Text/Conversation-EarthStation.json"),

			new TextString("Conversation-Placeholder-Content", "../Content/Text/Conversation-Placeholder-Content.txt"),

			new TextString("Conversation-Amorfus", conversationPlaceholderPath),
			new TextString("Conversation-Araknoid", conversationPlaceholderPath),
			new TextString("Conversation-Daskapital", conversationPlaceholderPath),
			new TextString("Conversation-Ellfyn", conversationPlaceholderPath),
			new TextString("Conversation-Hyphae", conversationPlaceholderPath),
			new TextString("Conversation-Kehlemal", conversationPlaceholderPath),
			new TextString("Conversation-Lahkemup", conversationPlaceholderPath),
			new TextString("Conversation-Mauluska", conversationPlaceholderPath),
			new TextString("Conversation-Moroz", conversationPlaceholderPath),
			new TextString("Conversation-Muuncaf", conversationPlaceholderPath),
			new TextString("Conversation-Mazonae", conversationPlaceholderPath),
			new TextString("Conversation-Murch", conversationPlaceholderPath),
			new TextString("Conversation-Outsider", conversationPlaceholderPath),
			new TextString("Conversation-Raptor", conversationPlaceholderPath),
			new TextString("Conversation-Silikonix", conversationPlaceholderPath),
			new TextString("Conversation-Supial", conversationPlaceholderPath),
			new TextString("Conversation-Tempestrial", conversationPlaceholderPath),
			new TextString("Conversation-Triunion", conversationPlaceholderPath),
			new TextString("Conversation-Twyggan", conversationPlaceholderPath),
			new TextString("Conversation-Ugglegruj", conversationPlaceholderPath),
			new TextString("Conversation-Warpig", conversationPlaceholderPath),
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

	var timerHelper = new TimerHelper(24);

	var universe = Universe.new
	(
		"SpaceAdventureClone", "0.0.0", timerHelper, display, mediaLibrary, null
	);
	universe.initialize();
	universe.venueNext = new VenueControls
	(
		universe.controlBuilder.slideshow
		(
			universe,
			displaySizeInPixelsDefault,
			[
				[ "Black", "At first, it was black." ],
				[ "Red", "Then, it turned red." ],
				[ "Cyan", "Then it turned, I want to say, cyan?" ],
				[ "Black", "Then it was black again." ],
				[ "Black", "Whew!  That was quite a ride." ],
				[ "Black", "Anyway, here's a game." ],
			],
			universe.venueNext
		)
	);

	if (universe.debuggingMode != null)
	{
		debug(universe);
	}
}

