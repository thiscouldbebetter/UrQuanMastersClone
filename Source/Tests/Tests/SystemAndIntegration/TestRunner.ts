
class TestRunner
{
	run()
	{
		var testSuite = new TestSuite
		(
			"SystemAndIntegration",
			[
				new SystemTests()
			]
		);

		testSuite.run();
	}
}