
class TestTests extends TestFixture
{
	constructor()
	{
		super(TestTests.name);
	}

	tests(): ( () => void )[]
	{
		var returnTests =
		[
			this.alwaysPass
		];

		return returnTests;
	}

	// Tests.

	alwaysPass(): void
	{
		Assert.isTrue(true);
	}
}