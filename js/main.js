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
	var padding = 70;
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
		.attr("width", (width - 2*padding) / (2015-1760))
		.attr("height", (height - 2*padding) / 12)
		.attr("fill", function(d) {

			// Math.floor is important for the colors to appear.
			return "rgb("+Math.floor(colorScale(data.baseTemperature + d.variance))+" ,100 ,"+Math.floor(255-colorScale(data.baseTemperature + d.variance))+" )";
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
		});

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
	$("rect").hover(function(e){
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