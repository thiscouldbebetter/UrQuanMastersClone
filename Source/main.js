function main()
{
	//localStorage.clear();

	var mediaLibrary = new MediaLibrary
	(
		// images
		[
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
			new TextString("Instructions", "../Content/Text/Instructions.txt"),
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
}
