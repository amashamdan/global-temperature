/* This variable controls which version of the heap map to be shown. By default the 15 gradients heat map is shown. */
var color256 = false;
/* The list of colors forming the 15 colors gradient heat map. */
var colors15 = ["#0E4C4F", "#30645C", "#527C69", "#759476", "#97AC83", "#BAC490", "#DCDC9D", "#FFF5AB", "#EDD595", "#DBB680", "#C9976B", "#B77756", "#A55841", "#93392C", "#821A17"];
/* This variable stores the data to be plotted. It is declared as a global variable because it will accessed from different functions. */
var data;
/* URL to fetch data with AJAX request. */
var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";
/* AJAX request to fetch the data. */
$.ajax({
	url: url,
	dataType: 'json',
	success: function(data) {
		/* data saved in the global variable and then the plot function is called with the data and the selected map type. */
		window.data = data;
		plot(data, color256);
	},
	/* Erorr message if data not fetched. */
	error: function() {
		alert("Couldn't retreive data, please try again later.");
	}
})

/* The plot function handles all details of the chart. It accepts as arguments data to be plotted and a boolean variable specifying the type of the heat map. */
function plot(data, color256) {
	/* Dimensions and padding of the heat map. */
	var width = 1200;
	var height = 600;
	var padding = 70;
	/* Main svg is appended and given main attributes. */
	var chart = d3.select("#chart-area")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					// id needed when switching map type to remove the existing one.
					.attr("id", "main-svg")
					.style("background-color", "rgba(256, 256, 256, 0.7)");
	/* Scale for x axis, starts from earliest year to the latest. */
	var xScale = d3.scale.linear()
					.domain([d3.min(data.monthlyVariance, function(d) {
						return d.year;
					}), d3.max(data.monthlyVariance, function(d) {
						return d.year;
					})])
					.range([padding, width - padding]);
	/* x axis is defined. */
	var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(25)
	/* x axis is appended to the chart. */
	chart.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0, "+ (height - padding) +")")
		.call(xAxis);
	/* Scale for y axis which is defined as a time scale. */
	var yScale = d3.time.scale()
					.domain([new Date(0, 0, 1), new Date(0, 11, 31)])
					.range([padding, height - padding]);
	/* y axis is defined. */
	var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.ticks(d3.time.months) // Specify that ticks are months.
					.tickFormat(d3.time.format("%b"))//use %B to switch to full month name;
	/* A color scale. It returns a value between 0 and 255 depending on the temperature which in turn will be used to select a heat map color. */
	var colorScale = d3.scale.linear()
						.domain([d3.min(data.monthlyVariance, function(d) {
							return data.baseTemperature + d.variance;
						}), d3.max(data.monthlyVariance, function(d) {
							return data.baseTemperature + d.variance;
						})])
						.range([0,255]);
	/* y axis is appended. */
	chart.append("g")
		.attr("class", "yAxis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis)
		/* Select the text of all ticks on the y axis to modify their position. */
		.selectAll(".tick text")
		// The formula below to center month name in its interval regardless of the actual dimensions.
		.attr("y", ((height - 2*padding)/12) / 2)
	/* This method adds all rectangles to the heat map. */
	chart.selectAll("rect")
		.data(data.monthlyVariance)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return xScale(d.year);
		})
		.attr("y", function(d) {
			/* A geometrical formula to specify the starting postion of each data bar. */
			return padding + (d.month - 1) * ((height - 2*padding) / 12);
		})
		/* The width of each bar is found from the map area devided by the number of years. */
		.attr("width", (width - 2*padding) / (2015-1760))
		/* Height is map height devided by number of months. */
		.attr("height", (height - 2*padding) / 12)
		.attr("fill", function(d) {
			// Math.floor is important for the colors to appear.
			if (color256) {
				/* color256 is true, a 256 gradient map is used. The color of each bar is found by mixing red and blue gradients. Green if off. */
				return "rgb("+Math.floor(colorScale(data.baseTemperature + d.variance))+" ,0 ,"+Math.floor(255-colorScale(data.baseTemperature + d.variance))+" )";
			} else {
				/* if 15 gradients map to be used, the function getColor is called with the result of the coloScale. */
				return getColor(colorScale(data.baseTemperature + d.variance));
			}
		})
		/* The following four attributes will be used for infoWindow when the bar is hovered. */
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
		/* The class is assigned for each bar for styling and jQuery selection. */
		.attr("class", "dataRect");
	/* Chart title is appended. */
	chart.append("text")
		.attr("x", width / 2)
		.attr("text-anchor", "middle")
		.attr("y", padding / 2)
		.attr("font-size", "1.4em")
		.text("Monthly Global Surface Temperature Heat Map (Jan 1753 - Sep 2015)");
	/* x axis label is appended. */
	chart.append("text")
		.attr("x", width / 2)
		.attr("text-anchor", "middle")
		.attr("y", height - padding / 2.2)
		.attr("font-size", "1.2em")
		.text("Year");
	/* y axis label is appended. */
	chart.append("text")
		.attr("x", -height / 2)
		.attr("text-anchor", "middle")
		.attr("y", padding / 2)
		.attr("font-size", "1.2em")
		.attr("transform", "rotate(-90)")
		.text("Month");
	/* First note on the bottom is appended. */
	chart.append("text")
		.attr("x", padding)
		.attr("text-anchor", "start")
		.attr("y", height - padding / 3)
		.attr("font-size", "0.9em")
		.text("- Hover over the chart to see a points details.");
	/* Second note on the bottom is appended. */
	chart.append("text")
		.attr("x", padding)
		.attr("text-anchor", "start")
		.attr("y", height - padding / 6)
		.attr("font-size", "0.9em")
		.text("- Variance is the deviation from an average measured temperature of 8.86 ℃ in the period of Jan 1951 and Dec 1980.");
	/* The dimensions for each rectangle in the heat map legend. */
	var heatLegendHeight = 20;
	var heatLegendwidth = 25;
	/* If a 256 gradient map will be used: */
	if (color256) {
		/* from http://stackoverflow.com/questions/20837147/draw-a-d3-circle-with-gradient-colours */
		/* The gradient is defined. */
		var gradient = chart.append("svg:defs")
						    .append("svg:linearGradient")
						    .attr("id", "gradient")
						    .attr("x1", "0%")
						    .attr("y1", "0%")
						    .attr("x2", "100%")
						    .attr("y2", "0%")
		/* Gradient is given its properties. */
		gradient.append("svg:stop")
		    .attr("offset", "0%")
		    .attr("stop-color", "#0000ff")
		    .attr("stop-opacity", 1);
		gradient.append("svg:stop")
		    .attr("offset", "100%")
		    .attr("stop-color", "#ff0000")
		    .attr("stop-opacity", 1);
		/* Heat map rectangle is added and filled with the define gradient. */
		var rectangle = chart.append('rect')
		    .attr('x', 820)
		    .attr('y', height- padding / 2)
		    .attr('width', heatLegendwidth * 15)
		    .attr("height", heatLegendHeight)
		    .attr('fill', 'url(#gradient)');
		/* The next two methods adds words to the heat map legend. */
		chart.append("text")
				.attr("x", 820)
				.attr("y", height- padding / 2 + 30)
				.attr("text-anchor", "start")
				.attr("font-size", "0.7em")
				.text("Colder");
		chart.append("text")
				.attr("x", 820 + 15*heatLegendwidth)
				.attr("y", height- padding / 2 + 30)
				.attr("text-anchor", "end")
				.attr("font-size", "0.7em")
				.text("Warmer");
	/* If a 15 gradients map to be used: */
	} else {
		/* Loop through the colors and add a rectangle for each color. */
		for (var color in colors15) {
			chart.append("rect")
				/* color is the index in colors15, so it can be used to calculate the offset from the starting point of the legend. */
				.attr("x", 820 + color*heatLegendwidth)
				.attr("y", height- padding / 2)
				.attr("width", heatLegendwidth)
				.attr("height", heatLegendHeight)
				/* The fill is simply the index of the color at the color index. */
				.attr("fill", function() {
					return colors15[color];
				})
			/* A number is added for each color in the legend, each number is a temperature, this will clarify the range of temeratures represented by each color. */
			chart.append("text")
				.attr("x", 820 + color*heatLegendwidth)
				.attr("y", height- padding / 2 + 30)
				.attr("text-anchor", "middle")
				.attr("font-size", "0.7em")
				.text(function() {
					/* The formula devided the range of temperatures and adds an offset of the lowest temperature. 1.684 is the lowest temp and 13.888 is the heighest. */
					return (1.684 + (13.888 - 1.684) / 16 * color).toFixed(1);
				})
		}
	}
	/* A varialbe which indicates if the infoWindow is open or not. The infoWindow remains open as long as the map area is hovered, it just keeps changing position and info, it only closes once the pointer is not on the map area any more. */
	var infoClosed = true;
	/* The following 4 variables are declared here because they will be accessed by two different function (both .hover functions) */
	var infoWindow;
	var infoText1;
	var infoText2;
	var infoText3;
	/* Dimensions for the infoWindow. */
	var infoWindowWidth = 130;
	var infoWindowHeight = 60;
	/* Starting with hover'over' function when a data bar is hovered, the infoWindow will be shown */ 
	$(".dataRect").hover(function(e){
		/* If the infoWindow is not shown, the following executes. */
		if (infoClosed) {
			/* Append an info window and three lines of text to the chart. All given infoWindow class to control their visibility later on. */
			infoWindow = chart.append("rect").attr("class", "infoWindow");
			infoText1 = chart.append("text").attr("class", "infoWindow");
			infoText2 = chart.append("text").attr("class", "infoWindow");
			infoText3 = chart.append("text").attr("class", "infoWindow");
			/* infoClosed is inverted. */
			infoClosed = false;
		}
		/* Mouse position relative to the chart is detected and stored. */
		var xPosition = e.pageX - $("svg").offset().left;
		var yPosition = e.pageY - $("svg").offset().top;
		/* The infoWindow is wide and it runs off the main svg if left bars are hovered. This if statement checks for that and moves the infoWindow to the right of the pointer in case the if statement is true. */
		if (xPosition < infoWindowWidth + 10) {
			xPosition = xPosition + infoWindowWidth + 20;
		}
		/* The information of each bar are read from its attributes. */
		var temperature = $(this).attr("temperature");
		var month = $(this).attr("month");
		var year = $(this).attr("year");
		var variance = $(this).attr("variance");
		/* infoWindow properties are specified (postion keeps updating). */
		infoWindow.attr("width", infoWindowWidth)
					.attr("height", infoWindowHeight)
					.attr("x", xPosition - infoWindowWidth - 10 )
					.attr("y", yPosition - infoWindowHeight - 10)
					.attr("fill", "rgba(0, 0, 0, 0.7)")
					.attr("rx", 10)
					.attr("ry", 10);
		/* Month and year and the text position is updated. */
		infoText1.attr("x", xPosition - infoWindowWidth / 2 - 10 )
					.attr("y", yPosition - infoWindowHeight / 1.5 - 10)
					.attr("fill", "white")
					.attr("text-anchor", "middle")
					.attr("font-size", "0.8em")
					.text(month + "-" + year);
		/* Temperature and the text position is updated. */
		infoText2.attr("x", xPosition - infoWindowWidth / 2 - 10 )
					.attr("y", yPosition - infoWindowHeight / 2.3 - 10)
					.attr("fill", "white")
					.attr("text-anchor", "middle")
					.attr("font-size", "0.8em")
					// Nuber to convert temp to number instead of string so toFixed can be applied which rounds the number.
					.text("Temperature: " + Number(temperature).toFixed(3) + " ℃");
		/* Variance and the text position is updated. */
		infoText3.attr("x", xPosition - infoWindowWidth / 2 - 10 )
					.attr("y", yPosition - infoWindowHeight / 6 - 10)
					.attr("fill", "white")
					.attr("text-anchor", "middle")
					.attr("font-size", "0.8em")
					.text("Variance: " + variance + " ℃");
		/* The infoWindow and info text are faded in. */
		$(".infoWindow").fadeIn(300);
	/* hover'out' function: */
	}, function(){
		/* This filter checks all other rectangles and see if any is hovered next. */
		var isHovered = $('rect').filter(function() {
			return $(this).is(":hover"); 
		});
		/* isHovered[0] will be defined if a rect is hovered and the following will not be executed. If something other than rect is hovered, isHovered[0] will return undefined and the following executes. */
		if (!isHovered[0]) {		
			/* infoClosed is inverted indicating that the infoWindow is closed. */
			infoClosed = true;
			/* infoWindow and info text are removed. */
			d3.selectAll(".infoWindow").remove();
		}
	})
}
/* This function accepts a number between 0 and 255 (output of colorScale), and returns which color that corresponding bar should be given. */
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
/* A variable used in getMonth function. */
var months = ["January", "Febreuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/* Based on the month number, the month name will be returned. */
function getMonth(month) {
	return months[month - 1];
}
/* click handler for the gradient change button: */
$("#changeColor").click(function() {
	/* The main (parent) svg is removed. */
	d3.select("#main-svg").remove();
	/* The state of color256 is inverted to switch the map type. */
	color256 = !color256;
	/* The text on button is changed accordingly. */
	if (color256) {
		$("#changeColor").html("Switch to 15 gradients");
	} else {
		$("#changeColor").html("Switch to 256 gradients");
	}
	/* The plot function is called with data and the new state of color256. */
	plot(data, color256);
})