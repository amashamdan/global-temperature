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
	console.log(data);
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

	chart.append("g")
		.attr("class", "yAxis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis)
		.selectAll(".tick text")
		// The formula below to center month name in its interval regardless of the actual dimensions.
		.attr("y", ((height - 2*padding)/12) / 2)
}