var color256 = false;
var colors15 = ["#0E4C4F", "#30645C", "#527C69", "#759476", "#97AC83", "#BAC490", "#DCDC9D", "#FFF5AB", "#EDD595", "#DBB680", "#C9976B", "#B77756", "#A55841", "#93392C", "#821A17"];

var data;
var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

$.ajax({
	url: url,
	dataType: 'json',
	success: function(data) {
		window.data = data;
		plot(data, color256);
	},
	error: function() {
		alert("Couldn't retreive data, please try again later.");
	}
})

function plot(data, color256) {
	var width = 1200;
	var height = 600;
	var padding = 70;
	
	var chart = d3.select("#chart-area")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.attr("id", "main-svg")
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
		.attr("width", (width - 2*padding) / (2015-1760))
		.attr("height", (height - 2*padding) / 12)
		.attr("fill", function(d) {
			// Math.floor is important for the colors to appear.
			if (color256) {
				return "rgb("+Math.floor(colorScale(data.baseTemperature + d.variance))+" ,0 ,"+Math.floor(255-colorScale(data.baseTemperature + d.variance))+" )";
			} else {
				return getColor(colorScale(data.baseTemperature + d.variance));
			}
		})
		.attr("year", function(d) {
			return d.year;
		})
		.attr("month", function(d) {
			return getMonth(d.month);
		})
		.attr("variance", function(d) {
			return d.variance;
		})
		.attr("temperature", function(d) {
			return data.baseTemperature + d.variance;
		})
		.attr("colorXX", function(d) {return colorScale(data.baseTemperature + d.variance)})
		.attr("class", "dataRect");

	chart.append("text")
		.attr("x", width / 2)
		.attr("text-anchor", "middle")
		.attr("y", padding / 2)
		.attr("font-size", "1.4em")
		.text("Monthly Global Surface Temperature Heat Map (Jan 1753 - Sep 2015)");

	chart.append("text")
		.attr("x", width / 2)
		.attr("text-anchor", "middle")
		.attr("y", height - padding / 2.2)
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
		.text("- Variance is the deviation from an average measured temperature of 8.86 ℃ in the period of Jan 1951 and Dec 1980.");

	var infoClosed = true;
	// should be declared here.
	var infoWindow;
	var infoText1;
	var infoText2;
	var infoText3;
	var infoWindowWidth = 130;
	var infoWindowHeight = 60;

	if (color256) {
		/* from http://stackoverflow.com/questions/20837147/draw-a-d3-circle-with-gradient-colours */
		var gradient = chart.append("svg:defs")
						    .append("svg:linearGradient")
						    .attr("id", "gradient")
						    .attr("x1", "0%")
						    .attr("y1", "0%")
						    .attr("x2", "100%")
						    .attr("y2", "0%")
						    //.attr("spreadMethod", "pad");

		// Define the gradient colors
		gradient.append("svg:stop")
		    .attr("offset", "0%")
		    .attr("stop-color", "#0000ff")
		    .attr("stop-opacity", 1);

		gradient.append("svg:stop")
		    .attr("offset", "100%")
		    .attr("stop-color", "#ff0000")
		    .attr("stop-opacity", 1);

		// Fill the circle with the gradient
		var circle = chart.append('rect')
		    .attr('x', 820)
		    .attr('y', height- padding / 2)
		    .attr('width', 375)
		    .attr("height", 20)
		    .attr('fill', 'url(#gradient)');

		chart.append("text")
				.attr("x", 820)
				.attr("y", height- padding / 2 + 30)
				.attr("text-anchor", "start")
				.attr("font-size", "0.7em")
				.text("Colder");

		chart.append("text")
				.attr("x", 820 + 15*25)
				.attr("y", height- padding / 2 + 30)
				.attr("text-anchor", "end")
				.attr("font-size", "0.7em")
				.text("Warmer");

	} else {
		for (var color in colors15) {
			chart.append("rect")
				.attr("x", 820 + color*25)
				.attr("y", height- padding / 2)
				.attr("width", 25)
				.attr("height", 20)
				.attr("fill", function() {
					return colors15[color];
				})

			chart.append("text")
				.attr("x", 820 + color*25)
				.attr("y", height- padding / 2 + 30)
				.attr("text-anchor", "middle")
				.attr("font-size", "0.7em")
				.text(function() {
					return (1.684 + (13.888 - 1.684) / 16 * color).toFixed(1);
				})
		}
	}

	$(".dataRect").hover(function(e){
		if (infoClosed) {
			infoWindow = chart.append("rect").attr("class", "infoWindow");
			infoText1 = chart.append("text").attr("class", "infoWindow");
			infoText2 = chart.append("text").attr("class", "infoWindow");
			infoText3 = chart.append("text").attr("class", "infoWindow");
			infoClosed = false;
		}
		var xPosition = e.pageX - $("svg").offset().left;
		var yPosition = e.pageY - $("svg").offset().top;

		if (xPosition < infoWindowWidth + 10) {
			xPosition = xPosition + infoWindowWidth + 20;
		}

		var temperature = $(this).attr("temperature");
		var month = $(this).attr("month");
		var year = $(this).attr("year");
		var variance = $(this).attr("variance");

		infoWindow.attr("width", infoWindowWidth)
					.attr("height", infoWindowHeight)
					.attr("x", xPosition - infoWindowWidth - 10 )
					.attr("y", yPosition - infoWindowHeight - 10)
					.attr("fill", "rgba(0, 0, 0, 0.7)")
					.attr("rx", 10)
					.attr("ry", 10);

		infoText1.attr("x", xPosition - infoWindowWidth / 2 - 10 )
					.attr("y", yPosition - infoWindowHeight / 1.5 - 10)
					.attr("fill", "white")
					.attr("text-anchor", "middle")
					.attr("font-size", "0.8em")
					.text(month + "-" + year);

		infoText2.attr("x", xPosition - infoWindowWidth / 2 - 10 )
					.attr("y", yPosition - infoWindowHeight / 2.3 - 10)
					.attr("fill", "white")
					.attr("text-anchor", "middle")
					.attr("font-size", "0.8em")
					// Nuber to convert temp to number instead of string so toFixed can be applied which rounds the number.
					.text("Temperature: " + Number(temperature).toFixed(3) + " ℃");

		infoText3.attr("x", xPosition - infoWindowWidth / 2 - 10 )
					.attr("y", yPosition - infoWindowHeight / 6 - 10)
					.attr("fill", "white")
					.attr("text-anchor", "middle")
					.attr("font-size", "0.8em")
					// Nuber to convert temp to number instead of string so toFixed can be applied which rounds the number.
					.text("Variance: " + variance + " ℃");



		$(".infoWindow").fadeIn(300);

	}, function(){
		var isHovered = $('rect').filter(function() {
			return $(this).is(":hover"); 
		});
		if (!isHovered[0]) {		
			infoClosed = true;
			d3.selectAll(".infoWindow").remove();
		}
	})
}

function getColor(rgb) {
	if (rgb >= 0 && rgb < 17) {
		return "#0E4C4F";
	} else if (rgb >= 17 && rgb < 34) {
		return "#30645C";
	} else if (rgb >= 34 && rgb < 51) {
		return "#527C69";
	} else if (rgb >= 51 && rgb < 68) {
		return "#759476";
	} else if (rgb >= 68 && rgb < 85) {
		return "#97AC83";
	} else if (rgb >= 85 && rgb < 102) {
		return "#BAC490";
	} else if (rgb >= 102 && rgb < 119) {
		return "#DCDC9D";
	} else if (rgb >= 119 && rgb < 136) {
		return "#FFF5AB";
	} else if (rgb >= 136 && rgb < 153) {
		return "#EDD595";
	} else if (rgb >= 153 && rgb < 170) {
		return "#DBB680";
	} else if (rgb >= 170 && rgb < 187) {
		return "#C9976B";
	} else if (rgb >= 187 && rgb < 204) {
		return "#B77756";
	} else if (rgb >= 204 && rgb < 221) {
		return "#A55841";
	} else if (rgb >= 221 && rgb < 238) {
		return "#93392C";
	}  else if (rgb >= 238 && rgb <= 255) {
		return "#821A17";
	}
}

function getMonth(month) {
	if (month == 1) {
		return "January";
	} else if (month == 2) {
		return "Febreuary";
	} else if (month == 3) {
		return "March";
	} else if (month == 4) {
		return "April";
	} else if (month == 5) {
		return "May";
	} else if (month == 6) {
		return "June";
	} else if (month == 7) {
		return "July";
	} else if (month == 8) {
		return "August";
	} else if (month == 9) {
		return "September";
	} else if (month == 10) {
		return "October";
	} else if (month == 11) {
		return "November";
	} else if (month == 12) {
		return "December";
	}
}

$("#changeColor").click(function() {
	d3.select("#main-svg").remove();
	color256 = !color256;
	if (color256) {
		$("#changeColor").html("Switch to 15 gradients");
	} else {
		$("#changeColor").html("Switch to 256 gradients");
	}
	plot(data, color256);
})