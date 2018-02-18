// http://stackoverflow.com/questions/19027749/how-to-disable-slider-in-bootstrap-slider-js
// Extend the slider to add disable/enable functions
if ($.fn) {
	$.fn.slider.Constructor.prototype.disable = function () {
		this.picker.off();
	};

	$.fn.slider.Constructor.prototype.enable = function () {
	        if (this.touchCapable) {
	            // Touch: Bind touch events:
	            this.picker.on({
	                touchstart: $.proxy(this.mousedown, this)
	            });
	        } else {
	            this.picker.on({
	                mousedown: $.proxy(this.mousedown, this)
	            });
	        }
	};
}

Number.isInteger = Number.isInteger || function(value) {
	return typeof value === 'number' && 
	  isFinite(value) && 
	  Math.floor(value) === value;
  };

////////////////////////////////////////
// finance calculators
////////////////////////////////////////
function calculateMonthlyReturn(monthlyContribution, monthlyRate, numberOfMonths) {
	if (monthlyRate === 0) return monthlyContribution * numberOfMonths;
	var nextMonthRatio = 1 + monthlyRate;
	return monthlyContribution * nextMonthRatio * (Math.pow(nextMonthRatio, numberOfMonths - 1) - 1) / (monthlyRate);
}

function calcuateLumpsumReturn(initialAsset, annualRate, numberOfYears) {
	return initialAsset * Math.pow(1 + annualRate, numberOfYears);
}


function calcuateRemainingAssetWithMonthlyDistribution(initialAsset, monthlyRate, numberOfMonths, monthlyDistribution) {
	if (monthlyRate === 0) return initialAsset - numberOfMonths * monthlyDistribution;
	var z = 1 + monthlyRate;
	//return initialAsset * Math.pow(z, numberOfMonths - 1) - monthlyDistribution * ( Math.pow(z, numberOfMonths) - 1) / (z - 1) ;
	return initialAsset * Math.pow(z, numberOfMonths) - monthlyDistribution * z * (Math.pow(z, numberOfMonths - 1) - 1) / (monthlyRate);
}

function calculateMonthlyReturnFromAnnualReturn(annualRate) {
	return Math.pow(1 + annualRate, 1 / 12) - 1;
}


////////////////////////////////////////
// knockout VM for the table
////////////////////////////////////////

function UserInputViewModel() {
	var self = this;
	self.age = ko.observable(32, { persist: 'age' });
	self.retirementAge = ko.observable(65, { persist: 'retirementAge' });
	self.alreadyRetired = ko.computed(function () {
		return +self.retirementAge() <= +self.age();
	});
	self.asset = ko.observable(100, { persist: 'asset' });
	self.monthlySavings = ko.observable(500, { persist: 'monthlySavings' });
	self.monthlyRetirementIncome = ko.observable(5000, { persist: 'monthlyRetirementIncome' });
	self.lifeExpectancy = ko.observable(95, { persist: 'lifeExpectancy' });
	self.realReturnRate = ko.observable(8.0, { persist: 'realReturnRate' });
	self.inflationRate = ko.observable(3.0, { persist: 'inflationRate' });
	self.userMessage = ko.observable('', { persist: 'userMessage' });
	self.changeAssumptionsText = ko.observable('Show Assumptions', { persist: 'changeAssumptionsText' });

	self.changeAssumptions = function () {
		if ($('.additionalControls').is(':visible')) {
			self.changeAssumptionsText('Show Assumptions');
		} else {
			self.changeAssumptionsText('Hide Assumptions');
		}
		$('.additionalControls').slideToggle();
	}
	self.resetToDefault = function () {
		self.age(32);
		self.retirementAge(65);
		self.asset(100);
		self.monthlySavings(500);
		self.monthlyRetirementIncome(5000);
		self.lifeExpectancy(95);
		self.realReturnRate(8.0);
		self.inflationRate(3.0);
		self.asset(100);
		self.changeAssumptionsText('Show Assumptions');
		$('.additionalControls').hide();
		allocateAsset(userInputVM);
	};

	self.currentDatasetIndex = ko.observable(0, { persist: 'currentDatasetIndex' });

	self.selectedFundFamily = ko.observable('Default', { persist: 'selectedFundFamily' });
	self.preferredFundFamilies = ko.observableArray(['Default', 'Increment up yield', 'Increment up yield - Schwab Customer']);

	self.funds = ko.observableArray();//refreshFundsTable(self.currentDatasetIndex, self.selectedFundFamily));

	self.selectedFundFamily.subscribe(function (newSelectedFundFamily) {
		console.log(newSelectedFundFamily);
		refreshFundsTable(self.currentDatasetIndex(), newSelectedFundFamily);
	});
}
var userInputVM;

////////////////////////////////////////
// set up bootstrap controls
////////////////////////////////////////

var previousMonthlySavings = 0;
var lastSliderStopAlreadyRetired = false;
function handleSlideStop(e) {

	// Automatically set the value to min or max if the number input is out of the range. Don't care about slider as it's impossible to go out of range.
	var numberInputElement = e.target;
	if (numberInputElement.getAttribute('type') === 'number') {
		var min = +(numberInputElement.getAttribute('min'));
		var max = +(numberInputElement.getAttribute('max'));
		if (numberInputElement.value < min) {
			numberInputElement.value = min;
		}
		else if (numberInputElement.value > max) {
			numberInputElement.value = max;
		}

		ko.dataFor(numberInputElement)[numberInputElement.getAttribute("id")](numberInputElement.value);
	}
	// else if (numberInputElement.getAttribute('type') === 'text') {
	// 	// Only show one digit decimal
	// 	if(!Number.isInteger(numberInputElement.value)) {
	// 		numberInputElement.value = numberInputElement.value.toFixed(1);
	// 	}
	// 	ko.dataFor(numberInputElement)[numberInputElement.getAttribute("id")](numberInputElement.value);
	// }


	if (userInputVM.alreadyRetired() && !lastSliderStopAlreadyRetired) {
		previousMonthlySavings = userInputVM.monthlySavings();
		userInputVM.monthlySavings(0);
		lastSliderStopAlreadyRetired = true;
		$('#monthlySavings').prop('title', 'Monthly savings is assumed to be 0 when in retirement');
		$('#monthlySavings-slider input').slider('disable');
		$('#monthlySavings-slider').prop('title', 'Monthly savings is assumed to be 0 when in retirement');
	} else if (!userInputVM.alreadyRetired() && lastSliderStopAlreadyRetired) {
		userInputVM.monthlySavings(previousMonthlySavings);
		previousMonthlySavings = 0;
		lastSliderStopAlreadyRetired = false;
		$('#monthlySavings').prop('title', '');
		$('#monthlySavings-slider input').slider('enable');
		$('#monthlySavings-slider').prop('');
	}
	allocateAsset(userInputVM);
}


	////////////////////////////////////////
	// custom knockout binding for the text input and Bootstrap slider
	////////////////////////////////////////
	ko.bindingHandlers.sliderValue = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var value = valueAccessor();
			$(element).slider('setValue', value());
			$(element).on('slide', function (ev) {
				value(ev.value);
			});
		},
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var value = valueAccessor();

			var currentValue = +value()

			if(element.id.indexOf('realReturnRate') === 0 || element.id.indexOf('inflationRate') === 0) {
				// Only show one digit decimal
				// console.log(currentValue)
				currentValue = currentValue.toFixed(1);
				// console.log(currentValue)
				(element.id.indexOf('realReturnRate') === 0) ? userInputVM.realReturnRate(currentValue) : userInputVM.inflationRate(currentValue)
			}

			$(element).slider('setValue', currentValue);
		}
	};

var eisrcDisclaimerContent = '<p>The purpose of this tool is to provide a sample investment portfolio to prospective EISRC clients given an investor\'s current age, funds, and retirement time horizon.  The tool will provide transparency regarding how EISRC invests for a typical client. If you are not yet a client, the information provided by this tool is for educational purposes only and is not intended as specific investment advice for you. It is based on inputs and assumptions provided by you. The calculations and portfolio provided do not infer that EISRC assumes any fiduciary duties unless there is an Investment Advisory Agreement / Contract in place with you and EISRC. The calculations and portfolio provided should not be construed as financial, legal or tax advice. This information, including expense ratios, is supplied from sources we believe to be reliable but we cannot guarantee its accuracy. The sole purpose of the Retirement Projection section of the tool is to determine whether the investor is likely to have adequate funding to retire. Accordingly, at age 65 and older, if the investor has inadequate retirement funding, a more conservative portfolio than normal is displayed in order to conserve the assets the investor has. It is assumed that the "Monthly Savings" input is expressed in today\'s dollars and will have to be adjusted each year for inflation. The assumed rate of return used by the Retirement Projection is setup in the assumptions section as a fixed amount and is in no way tied to past performance of the specific portfolio displayed. Past performance does not guarantee nor indicate future results. </p><p>The Model Portfolio displayed consists primarily of low-cost Index Exchange-Traded Funds and is based on research from EISRC, a fee-only, independent Registered Investment Advisor firm in the State of Oregon. EISRC is not providing investment advice through this tool, but rather providing an example of a typical EISRC client portfolio. If you are an Oregon resident, an institution or an accredited investor please contact EISRC for more details and specific advice tailored for you. </p><p>I acknowledge that I have read and agree to the above Terms and Conditions.  I also agree to the EISRC website terms of service and have read the privacy policy and site disclaimer which are available through the links at the bottom of the EISRC home page.</p>';

$(function () {
	// Set logo at the top
	if (/eisrc.com$/.test(document.location.hostname)) {
		$('#top-logo').attr('src', 'http://eisrc.com/wp-content/uploads/2014/06/image01.jpg');
	}

	// check if the session cookie is set. If not, display the term dialog
	if (document.cookie.indexOf('eisrc_allocation_tool_acknowledged=1') === -1) {
		if (/eisrc.com$/.test(document.location.hostname)) {
			$('#disclaimerContent').html(eisrcDisclaimerContent);
		}
		$('#myModal').modal();
	}


	// Hook up print PDF button
	$('#printPdf').on('click', function () {
		fundTableToPdf(svg.data()[0]);
		pdfMake.createPdf(dd).download('portfolio.pdf');
	});



	$('#copyrightOwner').text(pdfParameterToPrint.copyrightOwner);

	// Buttons on disclaimer overlay
	$('#closeDisclaimerTop').on('click', function () {
		location.href = '//www.google.com';
	});
	$('#closeDisclaimerBottom').on('click', function () {
		location.href = '//www.google.com';
	});
	$('#acceptDisclaimerBottom').on('click', function () {
		document.cookie = 'eisrc_allocation_tool_acknowledged=1; path=/';
	});

	// KO view model
	userInputVM = new UserInputViewModel();
	ko.applyBindings(userInputVM, document.getElementById('allocationApp'));



	if (userInputVM.changeAssumptionsText() === 'Show Assumptions') {
		$('.additionalControls').hide();
	}

	// Initialize allocation
	allocateAsset(userInputVM);

	// Only allow numbers to be typed in number input boxes
	$('input[type="number"]').on('keydown', function (e) {
		// Allow: backspace, delete, tab, escape, enter
		if ($.inArray(e.keyCode, [/*46, */8, 9, 27, 13, 110]) !== -1 ||
			// Allow: Ctrl+A
			(e.keyCode == 65 && e.ctrlKey === true) ||
			// Allow: home, end, left, right, up, down
			(e.keyCode >= 35 && e.keyCode <= 40) ||
			// Allow F1-F12
			(e.keyCode >= 112 && e.keyCode <= 123)) {
			// let it happen, don't do anything
			return;
		}
		// Ensure that it is a number and stop the keypress
		if (e.keyCode != 190 && (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});

	// When slider stops, update allocation
	$('.sliderContainer input[type="text"]').on('slideStop', handleSlideStop);

	// When Number input changes, update allocation
	// $('input[type="number"]').on('focus', function(e) {
	// console.log(e.currentTarget.value);
	// });
	$('input[type="number"]').on('change', handleSlideStop);


	$('.selectpicker').selectpicker({
		width: '180px'
	});

	$('#current-year').text((new Date()).getFullYear())
});

////////////////////////////////////////
// draw D3 based pie chart
////////////////////////////////////////

var svg, path, pie, arc, labelr, labelMargin;

var dataArcs,
	arcs;

function initializeSvg(data) {

	if (typeof (d3) === 'undefined') {
		console.warn('d3 is undefined');
		return;
	}

	var $constainer = $('#pieAllocation');
	var widthForSmallScreen = 200;
	var heightForSmallScreen = 180;
	var arcOffset = 0;
	var isSmallScreen = $('.container').width() < 768;
	if (isSmallScreen) {
		$constainer.width(widthForSmallScreen);
		$constainer.height(heightForSmallScreen);
		arcOffset = $('.container').width() / 2;
	}

	var width = (isSmallScreen) ? widthForSmallScreen : 620,
		height = (isSmallScreen) ? heightForSmallScreen : 310,
		radius = (isSmallScreen) ? Math.min(width, height) / 2 : Math.min(width, height) / 2 * 0.75,
		labelMargin = 5,
		labelr = radius + labelMargin;


	var outerRadius = radius - 10;
	var innerRadius = (isSmallScreen) ? outerRadius * 0.7 : outerRadius * 0.6;

	arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	svg = d3.select("#pieAllocation")
		.append("svg")
		.attr("width", '100%')
		.attr("height", '100%')
		.attr('viewBox', '0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
		.attr('preserveAspectRatio', 'xMinYMin')
		.data([data]);
	//.attr("width", width)
	//.attr("height", height);
	//.append("g")
	//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	// Display 80% / 20%
	svg.append('text')
		.attr('x', (isSmallScreen) ? (arcOffset + 3) : (width / 2 + 10))
		.attr('y', height / 2 + 5)
		.attr('id', 'stockBondAllocations')
		.attr('fill', 'DarkGray')
		.attr("text-anchor", 'middle')
		.attr("font-size", "18px")
		.attr("font-weight", "bold")
		.text(buildStockBondAllocationsText(data));

	// Display Stock
	svg.append('text')
		.attr('x', (isSmallScreen) ? (arcOffset - 23) : (width / 2 - 18))
		.attr('y', height / 2 + 20)
		.attr('id', 'stockText')
		.attr('fill', 'DarkGray')
		.attr("text-anchor", 'middle')
		.attr("font-size", "12px")
		.attr("font-weight", "bold")
		.text("Stock");
	//.text(buildStockBondAllocationsText(data));

	// Display Bond
	svg.append('text')
		.attr('x', (isSmallScreen) ? (arcOffset + 28) : (width / 2 + 35))
		.attr('y', height / 2 + 20)
		.attr('id', 'bondText')
		.attr('fill', 'DarkGray')
		.attr("text-anchor", 'middle')
		.attr("font-size", "12px")
		.attr("font-weight", "bold")
		.text("Bond");
	//.text(buildStockBondAllocationsText(data));

	pie = d3.layout.pie()
		.value(function (d) { return d; })
		.sort(null);

	dataArcs = svg.selectAll("g.arc")
		.data(pie);

	arcs = dataArcs.enter()
		.append("g")
		.attr("class", "arc")
		.attr("transform", "translate(" + (isSmallScreen ? arcOffset : (width / 2 + 10)) + ", " + (height / 2 + 5) + ")");

	path = arcs.append("path")
		.attr("fill", function (d, i) {
			return color(i);
		})
		.attr("d", arc)
		.style('stroke', 'white')
		.style('stroke-width', 1)
		.each(function (d) { this._current = d; });

	// Make sure text doesn't overlap
	var textPosition = buildTextPosition();

	arcs.append("text")
		.attr("transform", function (d, i) {
			return "translate(" +
				textPosition[i][0] + ',' +
				textPosition[i][1] + ")";
		})
		.attr("text-anchor", function (d, i) {
			// if this is the last fund, anchor at the left
			// The last one is always cash with a small percentage
			if (i === (labelset.length - 1) && d.value <= 5) {
				return "start";
			}
			else {
				// are we past the center?
				return (d.endAngle + d.startAngle) / 2 > Math.PI ?
					"end" : "start";
			}
		})
		.text(function (d, i) {
			if (d.value === 0) {
				return "";
			} else {
				return labelset[i] + " " + d.value + "%";
			}
		});



	if (isSmallScreen) {
		$('g text').hide();

		// $('svg > text').each( function() {
		// $(this).attr('x', +$(this).attr('x') + 60);
		// });
	}
}


function setData(index) {
	//pie = d3.layout.pie(datasetToUse[index]);
	svg.data([datasetToUse[index]]);
	pie = d3.layout.pie()
		.value(function (d) { return d; })
		.sort(null);

	path = path.data(pie); // compute the new angles
	path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs

	svg.select('#stockBondAllocations')
		.text(buildStockBondAllocationsText(datasetToUse[index]));


	// Make sure text doesn't overlap
	var textPosition = buildTextPosition();

	svg.selectAll("g text")
		.data(pie)
		.transition()
		.duration(800)
		.tween("text", function (d) {
			var i = d3.interpolate(this.textContent, d);

			return function (t) {
				this.textContent = Math.round(i(t));
			};
		})
		.attr("transform", function (d, i) {
			return "translate(" +
				textPosition[i][0] + ',' +
				textPosition[i][1] + ")";
		})
		.attr("text-anchor", function (d, i) {
			if ((i === (labelset.length - 1)) && (d.data < 6)) {
				return "start";
			}
			else {
				// are we past the center?
				return (d.endAngle + d.startAngle) / 2 > Math.PI ?
					"end" : "start";
			}
		})
		.text(function (d, i) {
			if (d.value === 0) {
				return "";
			} else {
				return labelset[i] + " " + d.value + "%";
			}
		});
}


function buildTextPosition() {
	var textPosition = [];
	path.each(function (d) {
		textPosition.push(arc.centroid(d));
	});

	if (textPosition.length == 0) return [];

	var labelRadius = 125;
	var h = Math.sqrt(textPosition[0][0] * textPosition[0][0] + textPosition[0][1] * textPosition[0][1]);
	textPosition.map(function (d) {
		d[0] = d[0] * labelRadius / h; //x
		d[1] = d[1] * labelRadius / h; //y
	});

	addOffsetToY(textPosition);
	return textPosition;
}

function addOffsetToY(textPosition) {
	if (textPosition.length == 0) return;

	// intentionally start with index 1
	for (var i = 1; i < textPosition.length - 1; i++) {
		if (datasetToUse[userInputVM.currentDatasetIndex()][i] === 0) continue;

		// Find the last non-zero item index
		var previousNonZeroIndex = lastIndexOfNonZeroItem(i, datasetToUse[userInputVM.currentDatasetIndex()]);
		if (previousNonZeroIndex !== -1) {
			// On right side, we should add Y offset to push down.
			if (textPosition[i][0] > 0 && (textPosition[i][1] - textPosition[previousNonZeroIndex][1]) < 15) {
				textPosition[i][1] = textPosition[previousNonZeroIndex][1] + 15;
			}
			// On left side, we should minus Y offset to push up.
			if (!isFirstItemOnLeft(i, textPosition) &&
				textPosition[i][0] <= 0 &&
				(textPosition[previousNonZeroIndex][1] - textPosition[i][1]) < 15) {
				textPosition[i][1] = textPosition[previousNonZeroIndex][1] - 15;
			}
		}
	}
}

function isFirstItemOnLeft(currentIndex, textPosition) {
	var lastNonZeroIndex = lastIndexOfNonZeroItem(currentIndex, datasetToUse[userInputVM.currentDatasetIndex()]);
	if (lastNonZeroIndex == -1) return false;
	return textPosition[currentIndex][0] <= 0 && textPosition[lastNonZeroIndex][0] >= 0;
}

function lastIndexOfNonZeroItem(currentIndex, inputArray) {
	if (currentIndex > (inputArray.length - 1) || currentIndex == 0) return -1;
	for (var i = currentIndex - 1; i > -1; i--) {
		if (inputArray[i] !== 0) {
			return i;
		}
	}
	return -1;
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
	//debugger;
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function (t) {
		return arc(i(t));
	};
}
