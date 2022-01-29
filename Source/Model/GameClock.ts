
class GameClock implements EntityProperty<GameClock>
{
	gameSecondsPerRealSecond: number;

	constructor(gameSecondsPerRealSecond: number)
	{
		this.gameSecondsPerRealSecond = gameSecondsPerRealSecond;
	}

	toEntity(): Entity
	{
		return new Entity(GameClock.name, [ this ] );
	}

	// Clonable.

	clone(): GameClock
	{
		return new GameClock(this.gameSecondsPerRealSecond);
	}

	overwriteWith(other: GameClock): GameClock
	{
		this.gameSecondsPerRealSecond = other.gameSecondsPerRealSecond;
		return this;
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world as WorldExtended;
		var timerHelper = uwpe.universe.timerHelper;
		var gameSecondsPerTick =
			this.gameSecondsPerRealSecond / timerHelper.ticksPerSecond;
		world.gameSecondsSinceStart += gameSecondsPerTick;
	}

	// Equatable.

	equals(other: GameClock): boolean
	{
		return (this.gameSecondsPerRealSecond == other.gameSecondsPerRealSecond);
	}
}