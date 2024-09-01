Ur-Quan Masters Clone
=====================

The code in this repository is eventually intended to reproduce all the basic functionality
of the engine for the game _Ur-Quan Masters_, also known as _Star Control 2_.
The reimplementation uses TypeScript and an existing game framework available at the URL
"https://github.com/thiscouldbebetter/GameFrameworkTS".

To play the game, open the file Source/_SpaceAdventureSequelClone.html in a web browser
that runs JavaScript.  To allow reading files from the filesystem, it may be necessary
to host the game in a web server, or alternatively to customize the web browser configuration.
For example, Google Chrome should be started with the "--allow-file-access-from-files" command-line option.

To minimize the possibility of legal entanglements, it was initially decided that this repository
would not contain any actual content files from the original game, nor any other third-party
copyrighted information.  However, this was slowing down development, so currently some files from
the original game have been included in this repository.  Rest assured, however, that they will be
swiftly removed upon request from their rightsholders.  Note this content is currently available at
the URL "https://sourceforge.net/projects/sc2/files/latest/download".  In the final released version,
importing of content data will probably be handled by copying the directory structure from there
over any existing data in the Content/Import directory.


Screenshots
-----------

![Introduction](/Screenshots/Screenshot-Introduction.png?raw=true "Introduction")
![Title](/Screenshots/Screenshot-Title.png?raw=true "Title")
![Hyperspace](/Screenshots/Screenshot-Hyperspace.png?raw=true "Hyperspace")
![Hyperspace Map](/Screenshots/Screenshot-HyperspaceMap.png?raw=true "Hyperspace Map")
![Starsystem](/Screenshots/Screenshot-Starsystem.png?raw=true "Starsystem")
![Planet Vicinity](/Screenshots/Screenshot-PlanetVicinity.png?raw=true "Planet Vicinity")
![Planet Orbit](/Screenshots/Screenshot-PlanetOrbit.png?raw=true "Planet Orbit")
![Planet Surface](/Screenshots/Screenshot-PlanetSurface.png?raw=true "Planet Surface")
![Encounter](/Screenshots/Screenshot-Encounter.png?raw=true "Encounter")
![Conversation](/Screenshots/Screenshot-Conversation.png?raw=true "Conversation")
![Conversation Transcript](/Screenshots/Screenshot-ConversationTranscript.png?raw=true "Conversation Transcript")
![Combat Ship Selection](/Screenshots/Screenshot-CombatShipSelect.png?raw=true "Combat Ship Selection")
![Combat](/Screenshots/Screenshot-Combat.png?raw=true "Combat")
![Combat Debriefing](/Screenshots/Screenshot-CombatDebriefing.png?raw=true "Combat Debriefing")
![Station](/Screenshots/Screenshot-Station.png?raw=true "Station")
![Station Dock](/Screenshots/Screenshot-StationDock.png?raw=true "Station Dock")


Building
--------
Note that, since the "transpiled" .js files are included in the repository, it shouldn't be necessary to build the game to play it.  However, to make and compile modifications, follow the steps outlined below.

* In any convenient directory, clone the repository using Git, perhaps by running the command "git clone --recursive https://github.com/thiscouldbebetter/UrQuanMastersClone".
* Ensure the TypeScript command-line compiler "tsc" is installed, perhaps by running the commands "sudo apt install npm" and then "sudo npm install -g typescript".
* Navigate to the repository's Source directory.
* From the source directory, run the command "tsc".
* Verify that no output is produced, which indicates that the build succeeded.
