var queryTask, query;
var execute;
var ownName;
require([
  "esri/tasks/query", "esri/tasks/QueryTask",
  "dojo/dom", "dojo/on", "dojo/parser","dojo/ready"
], function(
  Query, QueryTask,
  dom, on, parser, ready
){
	parser.parse();
	ready(function () {
		console.log("Loaded");
	});

  queryTask = new QueryTask("http://199.21.241.37/arcgis/rest/services/Bayfield/BayfieldCO_Parcels/MapServer/0");

  query = new Query();
  query.returnGeometry = false;
  query.outFields = ["*"];

  //on(dom.byId("execute"), "click", execute);

  execute = function execute() {
    query.where = "PRPID = 36580";
    //execute query
    queryTask.execute(query, showResults);
  }

  function showResults(results) {
		console.log("Some results");
		ownName = results.features[0].attributes.Short_Desc;
		location.href='#three';
    /*var s = "";
    for (var i=0, il=results.features.length; i<il; i++) {
      var featureAttributes = results.features[i].attributes;
      for (att in featureAttributes) {
        s = s + "<b>" + att + ":</b>  " + featureAttributes[att] + "<br>";
      }
      s = s + "<br>";
    }
    dom.byId("info").innerHTML = s;*/
  }
});