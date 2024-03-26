///////////////////////////////////////////
// data. Ideally they should be from the server via web api calls.
///////////////////////////////////////////

// These are the labels used to display asset type.
var labelset = [
'US Total Equity'
,'US Small Cap Value Equity'
,'International Equity'
,'REIT'
,'Emerging Mkt Stock'
,'Income Stock'	// Index < 6 is stock. Index >= 6 is bond
,'US Total Bond Mkt'
,'Treasury Inflation Prot Sec'
,'INTL Total Bond Mkt'
,'Short Term Bond'
,'Inv Grade Bond Ladder'  // index == 10
,'Emerging Market Bond'
,'High Yield Bond'
,'Cash / MM'
];

var stockCount = 6;
var ageRange = ''; // THis is the text used in DOCX to mark the user's age range and risk group.

function buildStockBondAllocationsText(array) {
	var stock=0,
		bond=0;
	
	for(var i=0; i<array.length; i++) {
		if(i<stockCount) {
			stock += array[i];
		} else {
			bond += array[i];
		}
	}
	
	return stock + "% / " + bond + "%";
}

// var fundNames = [
// 'Charles Schwab U.S. Broad Equity ETF (SCHB) ',
// 'Vanguard Small Cap Value ETF (VBR)',
// 'Vanguard FTSE Developed Markets ETF (VEA)',
// 'PowerShares KBW Premium Yield Equity REIT ETF (KBWY)',
// 'Charles Schwab Emerging Markets Equity ETF (SCHE)',
// 'Market Vectors Preferred ex Financials ETF (PFXF) ',
// 'Charles Schwab U.S. Aggregate Bond ETF (SCHZ)',
// 'Vanguard Short-Term Inflation-Protected Sec Index ETF (VTIP)',
// 'Vanguard Total Intl Bd Idx ETF (BNDX)',
// 'PIMCO Enhanced Short Maturity ETF (MINT)',
// 'US and INTL Rolling Bond Ladder - Investment Grade w/ Maturities 2-12 yrs',
// 'Vanguard Emerging Markets Government Bond Index ETF (VWOB)',
// 'Market Vectors Intl High Yield Bond ETF (IHY)',
// 'Cash/MM'
// ];

// var expenseRatio = [
// 0.04,
// 0.09,
// 0.1,
// 0.35,
// 0.14,
// 0.4,
// 0.05,
// 0.1,
// 0.2,
// 0.35,
// 'N/A',
// 0.35,
// 0.4,
// 'N/A'
// ];

var fundFamilies = {
	'Increment up yield': [
		{ name: "Vanguard Total Stock Market ETF (VTI)", expenseRatio: 0.05},
		{ name: "Vanguard Small Cap Value ETF (VBR)", expenseRatio: 0.09},
		{ name: "Vanguard FTSE Developed Markets ETF (VEA)", expenseRatio: 0.09},
		{ name: "PowerShares KBW Premium Yield Equity REIT ETF (KBWY)", expenseRatio: 0.35},
		{ name: "Vanguard FTSE Emerging Markets ETF (VWO) ", expenseRatio: 0.15},
		{ name: "Market Vectors Preferred ex Financials ETF (PFXF) ", expenseRatio: 0.4},
		{ name: "Vanguard Total Bond Market ETF (BND) ", expenseRatio: 0.07},
		{ name: "Vanguard Short-Term Inflation-Protected Sec Index ETF (VTIP)", expenseRatio: 0.1},
		{ name: "Vanguard Total Intl Bd Idx ETF (BNDX)", expenseRatio: 0.19},
		{ name: "Vanguard Short-Term Bond ETF (BSV)", expenseRatio: 0.1},
		{ name: "US and INTL Rolling Bond Ladder - Investment Grade w/ Maturities 2-12 yrs", expenseRatio: 'N/A'},
		{ name: "Vanguard Emerging Markets Government Bond Index ETF (VWOB)", expenseRatio: 0.34},
		{ name: "SPDR Barclays High Yield Bond (JNK)", expenseRatio: 0.4},
		{ name: "Cash/Money Market", expenseRatio: 'N/A'},
	],

	'Increment up yield - Schwab Customer': [
		{ name: "Schwab U.S. Broad Equity ETF (SCHB)", expenseRatio: 0.04},
		{ name: "Vanguard Small Cap Value ETF (VBR)", expenseRatio: 0.09},
		{ name: "Schwab International Equity ETF (SCHF)", expenseRatio: 0.08},
		{ name: "PowerShares KBW Premium Yield Equity REIT ETF (KBWY)", expenseRatio: 0.35},
		{ name: "Schwab Emerging Markets Equity ETF (SCHE)", expenseRatio: 0.14},
		{ name: "Market Vectors Preferred ex Financials ETF (PFXF) ", expenseRatio: 0.4},
		{ name: "Schwab U.S. Aggregate Bond ETF (SCHZ)", expenseRatio: 0.05},
		{ name: "Schwab US TIPS ETF (SCHP)", expenseRatio: 0.07},
		{ name: "Vanguard Total Intl Bd Idx ETF (BNDX)", expenseRatio: 0.19},
		{ name: "Vanguard Short-Term Bond ETF (BSV)", expenseRatio: 0.1},
		{ name: "US and INTL Rolling Bond Ladder - Investment Grade w/ Maturities 2-12 yrs", expenseRatio: 'N/A'},
		{ name: "PowerShares Emerging Markets Sov Dbt ETF (PCY)", expenseRatio: 0.5},
		{ name: "SPDR Barclays High Yield Bond (JNK)", expenseRatio: 0.4},
		{ name: "Cash/Money Market", expenseRatio: 'N/A'},
	],

	Default: [
		{ name: "Vanguard Total Stock Market ETF (VTI)", expenseRatio: 0.05},
		{ name: "Vanguard Small Cap Value ETF (VBR)", expenseRatio: 0.09},
		{ name: "Vanguard FTSE Developed Markets ETF (VEA)", expenseRatio: 0.09},
		{ name: "Vanguard REIT ETF (VNQ)", expenseRatio: 0.12},
		{ name: "Vanguard FTSE Emerging Markets ETF (VWO) ", expenseRatio: 0.15},
		{ name: "Vanguard Dividend Appreciation ETF (VIG)", expenseRatio: 0.1},
		{ name: "Vanguard Total Bond Market ETF (BND) ", expenseRatio: 0.07},
		{ name: "Vanguard Short-Term Inflation-Protected Sec Index ETF (VTIP)", expenseRatio: 0.1},
		{ name: "Vanguard Total Intl Bd Idx ETF (BNDX)", expenseRatio: 0.19},
		{ name: "Vanguard Short-Term Bond ETF (BSV)", expenseRatio: 0.1},
		{ name: "US and INTL Rolling Bond Ladder - Investment Grade w/ Maturities 2-12 yrs", expenseRatio: 'N/A'},
		{ name: "Vanguard Emerging Markets Government Bond Index ETF (VWOB)", expenseRatio: 0.34},
		{ name: "SPDR Barclays High Yield Bond (JNK)", expenseRatio: 0.4},
		{ name: "Cash/Money Market", expenseRatio: 'N/A'},
	]
};

// These are the allocation plans. The integers are in percentage. 
// It's in the same order as labels above.
// E.g. US Stock 80%, Intl Stock 20%, etc
var datasetRegular = [
[38,17,16,9,12, ,7,,,,,,,1], //0
[36,16,15,9,12, ,11,,,,,,,1], //1
[33,14,15,9,11,3,11,,, ,,3, ,1], //2
[30,12,14,9,10,5,11,2,2, ,,4, ,1], //3
[27,11,14,9,9,5,11,2,2, ,,5,4,1], //4
[23,9,13,9,8,5,11,4,3,3,,6,5,1], //5
[20,6,13,9,7,5,13,6,4,5,,6,5,1], //6
[18,5,12,9,6,5,15,6,5,6,,5,5,3], //7
[17,5,10,8,5,5,18,6,6,6,,5,5,4], //8
[14,4,7,7,3,5,22,9,7,7,,5,5,5], //9
[10,3,3,5,,4,24,11,7,15,,3,3,12], //10
[9, ,3,3,, ,26,13,7,20,, , ,19] //11
];



var messageRiskGroup2 = 'A slightly more conservative allocation than normal is being displayed because you may have inadequate funding to weather portfolio losses.';
var messageRiskGroup3 = 'A more conservative allocation than normal is being displayed because you have inadequate funding to weather portfolio losses.';
var messageRiskGroup4 = 'A much more conservative allocation than normal is being displayed because you have severely inadequate funding to weather portfolio losses.';

var explanationRegular = [
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	messageRiskGroup2,
	messageRiskGroup3,
	messageRiskGroup4
];

// empty ones will be undefined
var datasetLessThan20K = [
[92,0,0,0,0,0,8,0,0,0,0,0,0,0],
[88,0,0,0,0,0,12,0,0,0,0,0,0,0],
[85,0,0,0,0,0,15,0,0,0,0,0,0,0],
[80,0,0,0,0,0,20,0,0,0,0,0,0,0],
[75,0,0,0,0,0,25,0,0,0,0,0,0,0],
[67,0,0,0,0,0,33,0,0,0,0,0,0,0],
[60,0,0,0,0,0,40,0,0,0,0,0,0,0],
[55,0,0,0,0,0,45,0,0,0,0,0,0,0],
[50,0,0,0,0,0,50,0,0,0,0,0,0,0],
[40,0,0,0,0,0,60,0,0,0,0,0,0,0],
[25,0,0,0,0,0,75,0,0,0,0,0,0,0],
[15,0,0,0,0,0,85,0,0,0,0,0,0,0],
];

var basicMessageLessThan20K = 'Since your account size is under 20k, a simple allocation of one Total Bond Market fund and one Total Stock Market fund is displayed. This avoids excessive transaction costs.';
var explanationLessThan20K = [
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K,
	basicMessageLessThan20K + " " + messageRiskGroup2,
	basicMessageLessThan20K + " " + messageRiskGroup3,
	basicMessageLessThan20K + " " + messageRiskGroup4
];

var datasetRichAndOld = [
[], //10-25
[], //25-35
[], //35-40
[], //40-45
[], //45-50
[], //50-55
[20,6,13,9,7,5,,6,,5,17,6,5,1],
[18,5,12,9,6,5,,6,,6,20,5,5,3],
[17,5,10,8,5,5,,6,,6,24,5,5,4],
[14,4,7,7,3,5,,9,,7,29,5,5,5],
[10,3,3,5,,4,,11,,15,31,3,3,12],
[9, ,3,3,, ,,13,,20,33, , ,19],
];


var basicMessageRichAndOld = 'Although individual bonds are not a normal part of an index porfolio, many investors with this size account choose to own bond ladders instead of bond funds to assure return of a defined level of capital each year.';
var explanationRichAndOld = [
	'',
	'',
	'',
	'',
	'',
	'',
	basicMessageRichAndOld,
	basicMessageRichAndOld,
	basicMessageRichAndOld,
	basicMessageRichAndOld + " " + messageRiskGroup2,
	messageRiskGroup3,
	messageRiskGroup4
];

// keep track of which data set is being used
var datasetToUse = datasetRegular;

var explanationToUse;



function replaceUndefinedWithZero(originalArray) {
	return Array.apply(null, originalArray).map(function(d) { if(d === undefined) { return 0;} else { return d;} });
}

function prepareDataSet(arrayOfArray) {
	for(var i=0; i<arrayOfArray.length; i++) {
		if(arrayOfArray[i].length === 0) continue;
		arrayOfArray[i] = replaceUndefinedWithZero(arrayOfArray[i]);
	}
}

prepareDataSet(datasetRegular);
prepareDataSet(datasetLessThan20K);
prepareDataSet(datasetRichAndOld);

// return 0, 1, 2, 3 based on the risk of running out of principal.
// 0: will have 50%+ asset left at death
// 1: will have minimal asset (10%) left at death
// 2: will have no asset left at death
// 3: will have no asset years before death

// TODO: this modifies UI
function calculateRiskGroupIndex(userInput) {
	var currentAge = +userInput.age();
	var retirementAge = +userInput.retirementAge();
	var currentAsset = +userInput.asset() * 1000;
	var monthlySavings = +userInput.monthlySavings();
	var monthlyRetirementIncome = +userInput.monthlyRetirementIncome();
	var lifeExpectancy = +userInput.lifeExpectancy();
	var realReturnRate = (+userInput.realReturnRate() - (+userInput.inflationRate()) )/ 100;
	
	var assetAtRetirement = currentAsset;
	var monthlyRate = calculateMonthlyReturnFromAnnualReturn(realReturnRate);
	
	var remainingAssetAtDeath = 0;
	if(currentAge < retirementAge && retirementAge <= lifeExpectancy) {
		// normal sequence: work, retire, die
		assetAtRetirement = calcuateLumpsumReturn(currentAsset, 
								monthlyRate,
								(retirementAge - currentAge) * 12
							) + calculateMonthlyReturn(
								monthlySavings,
								monthlyRate,
								(retirementAge - currentAge) * 12
							);
			
		remainingAssetAtDeath = calcuateRemainingAssetWithMonthlyDistribution(
			assetAtRetirement,
			monthlyRate,
			(lifeExpectancy - retirementAge) * 12,
			monthlyRetirementIncome
			);
		
		// nothing for retirement
		if(assetAtRetirement === 0) {
			console.log("no asset at retirement");
			$('#message').removeClass();
			$('#message').addClass('alert alert-danger');
			userInput.userMessage('You will not have any assets at retirement.');
			return 3;
		}
		
		var withdrawMonths = -1;
		if(remainingAssetAtDeath < 0) {
			if(monthlyRate === 0) {
				withdrawMonths = assetAtRetirement / monthlyRetirementIncome;
			}
			else {
				withdrawMonths = Math.log( 1/ ( 1 - assetAtRetirement * monthlyRate / ( monthlyRetirementIncome * ( 1+ monthlyRate))) )/Math.log(1+monthlyRate);
			}
		}
		
		console.log("assetAtRetirement = " + assetAtRetirement);
		console.log("remainingAssetAtDeath = " + remainingAssetAtDeath);
		var remainingAssetRatio = remainingAssetAtDeath / assetAtRetirement;
		if(remainingAssetRatio >= 0.5) {
			console.log("rich at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-success');
			userInput.userMessage('You will have <b>$' + formatMoney(remainingAssetAtDeath) + '</b> left for your estate, in today\'s dollars.');
			return 0;
		} else if(remainingAssetRatio < 0.5 && remainingAssetRatio >= 0) {
			console.log("ok at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-success');
			userInput.userMessage('You will have <b>$' + formatMoney(remainingAssetAtDeath) + '</b> left for your estate, in today\'s dollars.');
			return 1;
		} else if(remainingAssetRatio < 0 && remainingAssetRatio >= -0.1) {
			console.log("poor at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-warning');
			userInput.userMessage(formatAssetRunOutMessage(currentAge, retirementAge, withdrawMonths));
			return 2;
		} else if(remainingAssetRatio < -0.1) {
			console.log("starving at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-danger');
			userInput.userMessage(formatAssetRunOutMessage(currentAge, retirementAge, withdrawMonths));
			
			return 3;
		}
	} else if (retirementAge <= currentAge && currentAge < lifeExpectancy ) {
		// retired already. assume no new contribution. only withdraw from retirement fund.
		assetAtRetirement = currentAsset;
		retirementAge = currentAge;
		
		// nothing for retirement
		if(assetAtRetirement === 0) {
			console.log("no asset at retirement");
			$('#message').removeClass();
			$('#message').addClass('alert alert-danger');
			userInput.userMessage('You will not have any assets at retirement.');
			return 3;
		}
		
		remainingAssetAtDeath = calcuateRemainingAssetWithMonthlyDistribution(
			assetAtRetirement,
			monthlyRate,
			(lifeExpectancy - currentAge) * 12,
			monthlyRetirementIncome
			);
		var withdrawMonths = -1;
		if(remainingAssetAtDeath < 0) {
			if(monthlyRate === 0) {
				withdrawMonths = assetAtRetirement / monthlyRetirementIncome;
			}
			else {
				withdrawMonths = Math.log( 1/ ( 1 - assetAtRetirement * monthlyRate / ( monthlyRetirementIncome * ( 1+ monthlyRate))) )/Math.log(1+monthlyRate);
			}
		}
		
		console.log("assetAtRetirement = " + assetAtRetirement);
		console.log("remainingAssetAtDeath = " + remainingAssetAtDeath);
		var remainingAssetRatio = remainingAssetAtDeath / assetAtRetirement;
		if(remainingAssetRatio >= 0.5) {
			console.log("rich at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-success');
			userInput.userMessage('You will have <b>$' + formatMoney(remainingAssetAtDeath) + '</b> left for your estate, in today\'s dollars.');
			return 0;
		} else if(remainingAssetRatio < 0.5 && remainingAssetRatio >= 0) {
			console.log("ok at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-success');
			userInput.userMessage('You will have <b>$' + formatMoney(remainingAssetAtDeath) + '</b> left for your estate, in today\'s dollars.');
			return 1;
		} else if(remainingAssetRatio < 0 && remainingAssetRatio >= -0.1) {
			console.log("poor at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-warning');
			userInput.userMessage(formatAssetRunOutMessage(currentAge, retirementAge, withdrawMonths));
			return 2;
		} else if(remainingAssetRatio < -0.1) {
			console.log("starving at death");
			$('#message').removeClass();
			$('#message').addClass('alert alert-danger');
			userInput.userMessage(formatAssetRunOutMessage(currentAge, retirementAge, withdrawMonths));
			
			return 3;
		}
	} else if (currentAge < lifeExpectancy && lifeExpectancy <= retirementAge ) {
		// will work until death
		assetAtRetirement = calcuateLumpsumReturn(currentAsset, 
								monthlyRate,
								(lifeExpectancy - currentAge) * 12
							) + calculateMonthlyReturn(
								monthlySavings,
								monthlyRate,
								(lifeExpectancy - currentAge) * 12
							);
							
		// nothing for retirement
		if(assetAtRetirement === 0) {
			console.log("no asset at retirement");
			$('#message').removeClass();
			$('#message').addClass('alert alert-danger');
			userInput.userMessage('You will not have any assets at retirement. Retirement Age should not exceed Life Expectancy.  Please update assumption.');
			return 3;
		}
		
		remainingAssetAtDeath = assetAtRetirement;
		$('#message').removeClass();
		$('#message').addClass('alert alert-success');
		userInput.userMessage('You will have <b>$' + formatMoney(remainingAssetAtDeath) + '</b> left for your estate, in today\'s dollars. Retirement Age should not exceed Life Expectancy.  Please update assumption.');
		return 0;
	} else if (currentAge >= lifeExpectancy){
	
		// nothing for retirement
		if(assetAtRetirement === 0) {
			console.log("no asset at retirement");
			$('#message').removeClass();
			$('#message').addClass('alert alert-danger');
			userInput.userMessage('You will not have any assets at retirement. Current Age should not exceed Life Expectancy.  Please update assumption.');
			return 3;
		}
		// you should be dead!!
		// will work until death
		if(assetAtRetirement * monthlyRate  >= monthlyRetirementIncome) {
			$('#message').removeClass();
			$('#message').addClass('alert alert-success');
			userInput.userMessage('Your assets are not likely to run out in your lifetime. Current Age should not exceed Life Expectancy.  Please update assumption.');
		}
		else {
		
			if(monthlyRate === 0) {
				withdrawMonths = assetAtRetirement / monthlyRetirementIncome;
			}
			else {
				withdrawMonths = Math.log( 1/ ( 1 - assetAtRetirement * monthlyRate / ( monthlyRetirementIncome * ( 1+ monthlyRate))) )/Math.log(1+monthlyRate);
			}
			$('#message').removeClass();
			$('#message').addClass('alert alert-warning');
			userInput.userMessage(formatAssetRunOutMessage(currentAge, retirementAge, withdrawMonths) + ' Current Age should not exceed Life Expectancy.  Please update assumption.');
		}

		return 0;
	}
}

// This function round the number to the first digit
// Change the "1" in "e+1" and "e-1" to the number of digits you want to keep
function roundToTwoDecimal(num) {
	var roundedNumber = +(Math.round(num + "e+2")  + "e-2");

	// Do nothing for integers
	if( roundedNumber % 1 === 0) return parseInt(roundedNumber);
	// Always keep two decimals for floats
	return roundedNumber.toFixed(2);
}

function formatMoney(asset) {
	if(asset < 1000) {
		return Math.round(asset); //roundToTwoDecimal(asset);
	}
	else if(asset >= 1000 && asset <1000000) {
		return numberWithCommas(Math.round(asset)); //roundToTwoDecimal(asset/1000) + 'K';
	} else if(asset >= 1000000 && asset <1000000000) {
		return roundToTwoDecimal(asset/1000000) + 'M';
	} else if(asset >= 1000000000 && asset <1000000000000){
		return roundToTwoDecimal(asset/1000000000) +'B';
	} else {
		return roundToTwoDecimal(asset/1000000000000) +'T';
	}
}

function formatAssetRunOutMessage(currentAge, retirementAge, monthsUntilRunOut) {
	var baseAge = retirementAge > currentAge ? retirementAge : currentAge;
	var isNotRetired = retirementAge > currentAge;
	if(monthsUntilRunOut < 1) {
		return 'Your assets will run out '
			+ (!isNotRetired ? 'in ' : '') 
			+ '<b>less than 1 month</b>' 
			+ (isNotRetired ? ' after you retire' : '') + '.';
	} else if(monthsUntilRunOut < 2) {
		return 'Your assets will run out '
			+ (!isNotRetired ? 'in ' : '') 
			+'<b>1 month</b>' 
			+ (isNotRetired ? ' after you retire' : '') + '.';
	} else if(monthsUntilRunOut < 12) {
		return 'Your assets will run out <b>'
			+ (!isNotRetired ? 'in ' : '') 
			+ Math.round(monthsUntilRunOut) 
			+ ' months</b>' 
			+ (isNotRetired ? ' after you retire' : '') + '.';
	} else {
		return 'Your assets will run out at age <b>' + Math.round(baseAge + monthsUntilRunOut/12) + '</b>.'
	}
}



// return data for iOS without updating the web page
function runCalculation(userInput) { 
	var dataset = getDataSetAndExplanation(userInput).dataset;
	var datasetIndex = getDatasetIndexAndAgeRange(userInput).datasetIndex;
	var fundsData = getFunds(dataset[datasetIndex], userInput.selectedFundFamily());

	console.log(userInput.userMessage())
	return {
		// indicates severity of remainingAssetsMessage
		riskGroupIndex: calculateRiskGroupIndex(userInput), 

		// the main message to the user
		remainingAssetsMessage: userInput.userMessage(),

		// some cases require special explanation
		explanation: getDataSetAndExplanation(userInput).explanation[datasetIndex],
		
		// only visible in PDF
		ageRange: getDatasetIndexAndAgeRange(userInput).ageRange, 
		
		// the allocation, funds, and category names to display
		funds: fundsData.funds,

		averageExpenseRatio: fundsData.averageExpenseRatio,

		// summary of distribution (X% Stock / Y% Bond) for middle of pie chart
		allocationText: buildStockBondAllocationsText(dataset[datasetIndex])
	}
}

// This function checks the user input and decide which allocation plan should be used.
function allocateAsset(userInput) {
	var rr = runCalculation(userInput)

	var datasetIndexAndAgeRange = getDatasetIndexAndAgeRange(userInput)
	// set global variables
	explanationToUse = getDataSetAndExplanation(userInput).explanation
	datasetToUse = getDataSetAndExplanation(userInput).dataset;
	ageRange = datasetIndexAndAgeRange.ageRange;

	var riskGroupIndex = datasetIndexAndAgeRange.riskGroupIndex;
	var datasetIndex = datasetIndexAndAgeRange.datasetIndex;
		
	// check if the new array is the same as what's being displayed.
	// only update pie and table if the actual data changed.
	var dataChanged = false;
	var currentDataArray = [];
	// if this function is called before a SVG is rendered, the svg is undefined.
	if (svg === undefined || svg.data() === undefined) {
		initializeSvg(datasetToUse[datasetIndex]);
		$('#explanation').text(explanationToUse[datasetIndex]);
		
		userInputVM.currentDatasetIndex(datasetIndex);
		refreshFundsTable(userInputVM.currentDatasetIndex(), userInputVM.selectedFundFamily()) 
	}
	else {
		currentDataArray = svg.data()[0];
		for(var i=0; i<datasetToUse.length; i++) {
			if(currentDataArray[i] !== datasetToUse[datasetIndex][i]) {
				dataChanged = true;
				break;
			}
		}
		if(dataChanged) {
			console.log('Allocation changed. updating pie and table.')
			userInputVM.currentDatasetIndex(datasetIndex);
			setData(datasetIndex); // update pie chart
			refreshFundsTable(userInputVM.currentDatasetIndex(), userInputVM.selectedFundFamily()) 
			$('#explanation').text(explanationToUse[datasetIndex]);
		}
	}
}

function getDataSetAndExplanation(userInput) {
	var dataset;
	var explanation;

	if (userInput.asset() < 20) {
		dataset = datasetLessThan20K;
		explanation = explanationLessThan20K;
	} else if (isRichAndOld(userInput)) {
		dataset = datasetRichAndOld;
		explanation = explanationRichAndOld;
	} else {
		dataset = datasetRegular;
		explanation = explanationRegular;
	}

	return {
		dataset: dataset,
		explanation: explanation
	}
}

function getDatasetIndexAndAgeRange(userInput) {
	var age = +userInput.age();
	var datasetIndex = 0;
	var ageRange;
	var riskGroupIndex = calculateRiskGroupIndex(userInput);
	
	if(age <= 25) {
		datasetIndex = 0;
		ageRange = "10-25"; // WARNING: global variable
	} else if(age > 25 && age <= 35) {
		datasetIndex = 1;
		ageRange = "25-35";
	} else if(age > 35 && age <= 40) {
		datasetIndex = 2;
		ageRange = "35-40";
	} else if (age > 40 && age <= 45) {
		datasetIndex = 3;
		ageRange = "40-45";
	} else if (age > 45 && age <= 50) {
		datasetIndex = 4;
		ageRange = "45-50";
	} else if (age > 50 && age <= 55) {
		datasetIndex = 5;
		ageRange = "50-55";
	} else if (age > 55 && age <= 60) {
		datasetIndex = 6;
		ageRange = "55-60";
	} else if (age > 60 && age <= 65) {
		datasetIndex = 7;
		ageRange = "60-65";
	} else {
		datasetIndex = 8 + riskGroupIndex;
		ageRange = "65+ RG" + riskGroupIndex;
	}	
	
	return {
		datasetIndex: datasetIndex,
		ageRange: ageRange,
		riskGroupIndex: riskGroupIndex,
	}
}

///////////////////////////////////////////
// utility functions
///////////////////////////////////////////


var color = null;

if (typeof(d3) === 'undefined') {
	console.warn('d3 is not defined');
	color = function() {}
} else {
	color = d3.scale.category20()
}

function getFunds(dataset, selectedFundFamily) {
	var funds = [];
	var averageExpenseRatio = 0;	
	var assetTypeCount = labelset.length;

	for (var i = 0; i < assetTypeCount; i++) {
		if (dataset[i] > 0) {
			var expenseRatio = fundFamilies[selectedFundFamily][i].expenseRatio;
			
			funds.push({
				allocation: dataset[i], 
				assetClass: labelset[i], 
				fundName: fundFamilies[selectedFundFamily][i].name, 
				expenseRatio: expenseRatio,
				fundColor: color(i)
			});
		
			averageExpenseRatio += 
				(expenseRatio == 'N/A' ? 0 : expenseRatio ) * dataset[i] / 100;
		}
	}
	
	return { 
		funds: funds,
		averageExpenseRatio: averageExpenseRatio
	}
}
	
function refreshFundsTable(indexOfFund, selectedFundFamily) {
	// build the fund array for display
	var fundsData = getFunds(datasetToUse[indexOfFund], selectedFundFamily);
	var funds = fundsData.funds;
	var averageExpenseRatio = fundsData.averageExpenseRatio;

	// Adam: I'm guessing blank row is here so table gets an row for averageExpenseRatio
	funds.push({
		allocation: '', 
		assetClass: '', 
		fundName: '', 
		expenseRatio: '',
		fundColor: ''
	});

	//console.log(newFundsArray);
	$('#tbodyFunds').fadeOut(400, function() {
		userInputVM.funds.removeAll();
		userInputVM.funds(funds);
				
		//$('#tbodyFunds tr:last td:nth-child(3)').addClass('text-right');
		$('#tbodyFunds tr:last').replaceWith( '<tr><td colspan="3" class="text-right">Total Expense Ratio (excludes possible commissions / advisor fees):</td><td class="text-center">'+formatExpenseRatio(averageExpenseRatio)+'</td></tr>');
		$('#tbodyFunds').fadeIn();
	});	
}

function isRichAndOld(userInput) {
	return (userInput.asset() >= 1500) && 
			(userInput.age() > 55);
}


function formatExpenseRatio(expenseRatio) {
	if(isNaN(expenseRatio)) {
		return expenseRatio;
	} else {
		return Number(expenseRatio).toFixed(2) + '%';
	}
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}