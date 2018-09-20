// Get references to page elements
var $exampleText = $("#example-text");
var $exampleDescription = $("#example-description");
var $submitBtn = $("#submit");
var $exampleList = $("#example-list");

// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function(example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/examples",
      data: JSON.stringify(example)
    });
  },
  getExamples: function() {
    return $.ajax({
      url: "api/examples",
      type: "GET"
    });
  },
  deleteExample: function(id) {
    return $.ajax({
      url: "api/examples/" + id,
      type: "DELETE"
    });
  }
};

// refreshExamples gets new examples from the db and repopulates the list
var refreshExamples = function() {
  API.getExamples().then(function(data) {
    var $examples = data.map(function(example) {
      var $a = $("<a>")
        .text(example.text)
        .attr("href", "/example/" + example.id);

      var $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": example.id
        })
        .append($a);

      var $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ");

      $li.append($button);

      return $li;
    });

    $exampleList.empty();
    $exampleList.append($examples);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function(event) {
  event.preventDefault();

  var example = {
    text: $exampleText.val().trim(),
    description: $exampleDescription.val().trim()
  };

  if (!(example.text && example.description)) {
    alert("You must enter an example text and description!");
    return;
  }

  API.saveExample(example).then(function() {
    refreshExamples();
  });

  $exampleText.val("");
  $exampleDescription.val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function() {
  var idToDelete = $(this)
    .parent()
    .attr("data-id");

  API.deleteExample(idToDelete).then(function() {
    refreshExamples();
  });
};

// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
$exampleList.on("click", ".delete", handleDeleteBtnClick);

var margin = {
    top: 20,
    right: 30,
    bottom: 40,
    left: 250
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);

var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.1);

var xAxis = d3.svg
  .axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg
  .axis()
  .scale(y)
  .orient("left")
  .tickSize(6, 0);

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

try {
  d3.tsv("data.tsv", type, function(error, data) {
    x.domain(
      d3.extent(data, function(d) {
        return d.value;
      })
    ).nice();
    y.domain(
      data.map(function(d) {
        return d.name;
      })
    );
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", function(d) {
        return "bar bar--" + (d.value < 0 ? "negative" : "positive");
      })
      .attr("x", function(d) {
        return x(Math.min(0, d.value));
      })
      .attr("y", function(d) {
        return y(d.name);
      })
      .attr("width", function(d) {
        return Math.abs(x(d.value) - x(0));
      })
      .attr("height", y.rangeBand());
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    var tickNegative = svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + x(0) + ",0)")
      .call(yAxis)
      .selectAll(".tick")
      .filter(function(d, i) {
        return data[i].value < 0;
      });
    tickNegative.select("line").attr("x2", 6);
    tickNegative
      .select("text")
      .attr("x", 9)
      .style("text-anchor", "start");
  });
} catch (error) {
  console.error(error);
}

function type(d) {
  d.value = +d.value;
  return d;
}
