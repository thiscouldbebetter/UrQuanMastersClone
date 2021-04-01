
class ResourceDistribution
{
	resourceDefnName: string;
	numberOfDeposits: number;
	quantityPerDeposit: number;

	constructor
	(
		resourceDefnName: string,
		numberOfDeposits: number,
		quantityPerDeposit: number
	)
	{
		this.resourceDefnName = resourceDefnName;
		this.numberOfDeposits = numberOfDeposits;
		this.quantityPerDeposit = quantityPerDeposit;
	}
}
