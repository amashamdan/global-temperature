var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

$.ajax({
	url: url,
	dataType: 'json',
	success: function(data) {
		plot(data);
	},
	error: function() {
		alert("Couldn't retreive data, please try again later.");
	}
})

function plot(data) {
	console.log(data)
	//data = addMonths(data);
	var width = 1200;
	var height = 600;
	var padding = 100;
	var chart = d3.select("#chart-area")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.style("background-color", "rgba(256, 256, 256, 0.7)");

	var xScale = d3.scale.linear()
					.domain([d3.min(data.monthlyVariance, function(d) {
						return d.year;
					}), d3.max(data.monthlyVariance, function(d) {
						return d.year;
					})])
					.range([padding, width - padding]);

	var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(25)

	chart.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0, "+ (height - padding) +")")
		.call(xAxis);

	var yScale = d3.time.scale()
					.domain([new Date(0, 0, 1), new Date(0, 11, 31)])
					.range([padding, height - padding]);

	var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.ticks(d3.time.months)
					.tickFormat(d3.time.format("%b"))//use %B to switch to full month name;

	var colorScale = d3.scale.linear()
						.domain([d3.min(data.monthlyVariance, function(d) {
							return data.baseTemperature + d.variance;
						}), d3.max(data.monthlyVariance, function(d) {
							return data.baseTemperature + d.variance;
						})])
						.range([0,255]);

	chart.append("g")
		.attr("class", "yAxis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis)
		.selectAll(".tick text")
		// The formula below to center month name in its interval regardless of the actual dimensions.
		.attr("y", ((height - 2*padding)/12) / 2)

	chart.selectAll("rect")
		.data(data.monthlyVariance)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return xScale(d.year);
		})
		.attr("y", function(d) {
			return padding + (d.month - 1) * ((height - 2*padding) / 12);
			//return yScale(d.wordMonth);
		})
		.attr("width", (width - 2*padding) / (2015-1759))
		.attr("height", (height - 2*padding) / 12)
		.attr("fill", function(d) {

			// Math.floor is important for the colors to appear.
			return "rgb("+Math.floor(255-colorScale(data.baseTemperature - d.variance))+" ,"+Math.floor(colorScale(data.baseTemperature - d.variance)/2)+" ,"+Math.floor(colorScale(data.baseTemperature - d.variance))+" )";
		})
		.attr("year", function(d) {
			return d.year;
		})

	chart.append("text")
		.attr("x", width / 2)
		.attr("text-anchor", "middle")
		.attr("y", padding / 2)
		.attr("font-size", "1.4em")
		.text("Monthly Global Surface Temperature Heat Map (Jan 1753 - Sep 2015)");

	chart.append("text")
		.attr("x", width / 2)
		.attr("text-anchor", "middle")
		.attr("y", height - padding / 2)
		.attr("font-size", "1.2em")
		.text("Year");

	chart.append("text")
		.attr("x", -height / 2)
		.attr("text-anchor", "middle")
		.attr("y", padding / 2)
		.attr("font-size", "1.2em")
		.attr("transform", "rotate(-90)")
		.text("Month");

	chart.append("text")
		.attr("x", padding)
		.attr("text-anchor", "start")
		.attr("y", height - padding / 3)
		.attr("font-size", "0.9em")
		.text("- Hover over the chart to see a points details.");

	chart.append("text")
		.attr("x", padding)
		.attr("text-anchor", "start")
		.attr("y", height - padding / 6)
		.attr("font-size", "0.9em")
		.text("- Variance is the deviation from an average measured temperature of 8.66 ℃ in the period of Jan 1951 and Dec 1980.");
}
/*
function addMonths(data) {
	for (var point in data.monthlyVariance) {
		if (data.monthlyVariance[point].month == 1) {
			data.monthlyVariance[point].wordMonth = "January"
		} else if (data.monthlyVariance[point].month == 2) {
			data.monthlyVariance[point].wordMonth = "Febreuary"
		} else if (data.monthlyVariance[point].month == 3) {
			data.monthlyVariance[point].wordMonth = "March"
		} else if (data.monthlyVariance[point].month == 4) {
			data.monthlyVariance[point].wordMonth = "April"
		} else if (data.monthlyVariance[point].month == 5) {
			data.monthlyVariance[point].wordMonth = "May"
		} else if (data.monthlyVariance[point].month == 6) {
			data.monthlyVariance[point].wordMonth = "June"
		} else if (data.monthlyVariance[point].month == 7) {
			data.monthlyVariance[point].wordMonth = "July"
		} else if (data.monthlyVariance[point].month == 8) {
			data.monthlyVariance[point].wordMonth = "August"
		} else if (data.monthlyVariance[point].month == 9) {
			data.monthlyVariance[point].wordMonth = "September"
		} else if (data.monthlyVariance[point].month == 10) {
			data.monthlyVariance[point].wordMonth = "October"
		} else if (data.monthlyVariance[point].month == 11) {
			data.monthlyVariance[point].wordMonth = "November"
		} else if (data.monthlyVariance[point].month == 12) {
			data.monthlyVariance[point].wordMonth = "December"
		}
	}
	return data;
}*/