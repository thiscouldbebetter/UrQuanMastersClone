
class SoundHelperMock implements SoundHelper
{
	audioContext(): AudioContext { return null; }
	controlSelectOptionsVolume(): ControlSelectOption<number>[]  { return null; }
	effectVolume: number;
	initialize(sounds: Sound[]): void {}
	musicVolume: number;
	reset(): void {}
	soundForMusic: Sound;
	soundForMusicPause(universe: Universe): void {}
	soundVolume: number;
	soundWithNamePlayAsEffect(universe: Universe, soundName: string): void {}
	soundWithNamePlayAsMusic(universe: Universe, soundName: string): void {}
	soundWithNameStop(soundName: string): void {}
	soundsAllStop(universe: Universe): void {}
}
