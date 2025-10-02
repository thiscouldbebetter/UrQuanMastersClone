
class SoundHelperMock implements SoundHelper
{
	audioContext(): AudioContext { return null; }
	controlSelectOptionsVolume(): ControlSelectOption<number>[] { return null; }
	effectVolume: number;
	musicVolume: number;
	soundPlaybackForMusic: SoundPlayback;
	soundPlaybackCreateFromSound(sound: Sound): SoundPlayback { return null; }
	soundPlaybackRegister(soundPlayback: SoundPlayback): void {}
	soundPlaybacksAllStop(universe: Universe): void {}
}
