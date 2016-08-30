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
	var width = 900;
	var height = 600;
	var padding = 100;
	var chart = d3.select("#chart-area")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.style("background-color", "rgba(256, 256, 256, 0.5)");
}