// create vars
var applicantInfo = {};  // applicant contact information
var ownerInfo = {};  // applicant contact information
var buildingInfo = {};  // applicant contact informationvar a;
var buildingInputList = []
var parcelPIN;
$( document ).ready(function() {  // run when document is ready
	baseURL = $.mobile.path.documentUrl.directory;
	console.log("saveInfo");
	
	/////////////////////////////////////////////////////////////////
	//  CAPTURE FORM DATA
	//  listen for 'Next' button click
	//  copy user input to json object
	// applicant info page
	$("#one .next").click( function () {  // list
		$("#one :text").each( function (index) {  // loop through text inputs
			var fldName = this.name;
			applicantInfo[fldName] = this.value;
		});
		$("#one :selected").each( function (index) { // get select input
			var fldName = $(this).parent().prop("name");
			applicantInfo[fldName] = this.value;
		});
		console.log(JSON.stringify(applicantInfo, undefined, 2));
	});
	// owner info page
	$("#two .next").click( function () {  // list

		// clear placeholder pre-submit
		$('[placeholder]').parents('form').find('[placeholder]').each(function() {
	    var input = $(this);
	    if (input.val() == input.attr('placeholder')) {
	      input.val('');
	    }
		});

		$("#two :text").each( function (index) {  // loop through text inputs
			var fldName = this.name;
			ownerInfo[fldName] = this.value;
		});
		$("#two :selected").each( function (index) { // get select input
			var fldName = $(this).parent().prop("name");
			ownerInfo[fldName] = this.value;
		});
		console.log(JSON.stringify(ownerInfo, undefined, 2));

		// execute parcel query
		execute(ownerInfo.parcelPIN); // send parcelPIN to query
	});
	// building info page
	$("#three .next").click( function () {  // list
		$("#three :text").each( function (index) {  // loop through text inputs
			var fldName = this.name;
			buildingInfo[fldName] = this.value;
		});
		$("#three :selected").each( function (index) { // get select input
			var fldName = $(this).parent().prop("name");
			buildingInfo[fldName] = this.value;
		});
		console.log(JSON.stringify(buildingInfo, undefined, 2));
		updateLocalStore();
	});

  //---------------------------------------
	// map applicant info to owner info
	$("#two :checkbox").click ( function () {
		console.log("copy app to owner");
		if (this.checked) {  // make sure checkbox is checked
			// iterate over owner info text input fields and grab data from applicant info
			$("#two :text").each( function (index) {
				//console.log(applicantInfo[this.name]);
				if (this.name != "parcelPIN" && applicantInfo[this.name] != 'undefined') this.value = applicantInfo[this.name]
			})
			// hard code the property name
			$("#two #state").val(applicantInfo["State"]);
			// force a refresh
			$("#two #state").selectmenu('refresh');
		}
	})


	///////////////////////////////////////////////////////
	// VALIDATE PARCEL PIN
	function validateParcelPIN () {
		// clear placeholder pre-submit
		$('[placeholder]').parents('form').find('[placeholder]').each(function() {
	    var input = $(this);
	    if (input.val() == input.attr('placeholder')) {
	      input.val('');
	    }
		});

		var x=$("#parcelPIN").val(); // get tax id no.
		console.log(x);
		// check for null, empty, or unchanged placeholder
		if (x==null || x=="" || x==$("#parcelPIN").prop("placeholder"))
	  {
	  	$("#validateParcelPIN").popup("open"); // open popup
		  // alert("You must provide a Tax ID No.");
		  // return false;
	  }
	  else {
			$.mobile.changePage("#confirmFormDialog");
			parcelPIN = x; // save parcel id
	  }
	}

	// show popup if tax ID invalid
	$("#two .next").click( function () {
		validateParcelPIN();
	});

	// if they click tribal lands button proceed to confirm dialog
	$("#tlButton").click( function () {
		$.mobile.changePage("#confirmFormDialog");
	})


	/////////////////////////////////////////////////////////
	// LOAD CONFIRM DIALOG DATA
	// grab data from json data
	// and load it into confirm dialog
	$( "#confirmFormDialog" ).on( "pagebeforeshow", function( event, pagedata ) {
		event.preventDefault();  // halt immediate loading
		//console.log(pagedata[0]);
		// load page data
		var pageID = pagedata.prevPage[0].attributes.getNamedItem("id").value;
		console.log(pageID);
		var content = "";
		var page = {};
		if (pageID == "one") {
			page = applicantInfo;
			//update href
			$("#confirmFormDialog #continueButton").prop("href", "#two");
		} else if (pageID == "two") {
			page = ownerInfo;
			//update href
			$("#confirmFormDialog #continueButton").prop("href", "#three");
			//update header title
			$("h6.ui-title").text("Confirm Owner Info");
		} else if (pageID == "three") {
			page = buildingInfo;
			$("#confirmFormDialog #continueButton").prop("data-rel", "external");
			//update href
			$("#confirmFormDialog #continueButton").prop("href", "mapPage.html");
			//update header title
			$("h6.ui-title").text("Confirm Building Info");
		}

		// loop through fields and add them to the content
		for (var prop in page) {
		  if (page.hasOwnProperty(prop)) {
		  	if (prop == "parcelPIN") {
		  		content += "<p>Tax ID No.: <strong style='font-family:Palatino Linotype'>" + page[prop] + "</strong></p>";
		  	} else {
		    	content += "<p>" + prop + ": <strong style='font-family:Palatino Linotype'>" + page[prop] + "</strong></p>";
		    }
		  }
		}
		// add content to dialog body
		$("#confirmDialogContent ").html(content);
		//pagedata.deferred.resolve( data.absUrl, data.options, page );
	});


	//////////////////////////////////////////////////////////////
	//	HIGHLIGHT UNFILLED FIELDS
	$( "#three" ).on( "pagebeforeshow", function() {
		// clear placeholder values
		$('[placeholder]').parents('form').find('[placeholder]').each(function() {
	    var input = $(this);
	    if (input.val() == input.attr('placeholder')) {
	      input.val('');
	    }
		});
		// loop through each of the fields and check for blank entries
		$("#three :text").each( function (index) {
			var input = $(this);
			console.log(input.val());
			if ( input.val() == '' ) {
				console.log('hello');
			}
		})
	})

	//////////////////////////////////////////////////////////////
	// Adds placeholder attribute to browser/device that don't have it
	// http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
	$('[placeholder]').focus(function() {
	  var input = $(this);
	  if (input.val() == input.attr('placeholder')) {
	    input.val('');
	    input.removeClass('placeholder');
	  }
	}).blur(function() {
	  var input = $(this);
	  if (input.val() == '' || input.val() == input.attr('placeholder')) {
	    input.addClass('placeholder');
	    input.val(input.attr('placeholder'));
	  }
	}).blur();

	///////////////////////////////////////////////////
	//  BROWSER BACK BUTTON
	//  capture browser back direction and adjust accordingly
	//  this is to prevent the back returning to an empty confirm dialog
	$(window).on("navigate", function (event, data) {
		var page = $.mobile.activePage.prop("id");
	  var direction = data.state.direction;
	  if (direction == 'back' ) {
	  	// back is a confirm dialog go back one more
	  	if (data.state.hash == "#confirmFormDialog") window.history.back();
	  }
	  if (direction == 'forward') {
	    // back is a confirm dialog go back one more
	  	if (data.state.hash == "#confirmFormDialog") {
	  		if (page == "two") validateParcelPIN(); // open validate popup
	  		else if (page == "one") $("#one .next").click(); // open confirm correctly
	  	}
	  }
	});

	////////////////////////////////////////////////////////////
	// PARCEL QUERY
	var queryTask, query, Rquery;
	var execute;
	var ownName;
	require([
	  "esri/tasks/query", "esri/tasks/QueryTask", "dojo/parser"
	], function( Query, QueryTask, parser ){
		parser.parse();

	  queryTask = new QueryTask("http://199.21.241.172/arcgis/rest/services/Bayfield/addressPts/MapServer/0");
	  RqueryTask = new QueryTask("http://199.21.241.172/arcgis/rest/services/Bayfield/addressPts/MapServer/1");

	  // parcel query
	  query = new Query();
	  query.returnGeometry = false;
	  query.outFields = ["Short_Desc", "SNID", "TNID", "RNID", "MCD"];
	  // parcel relate to buildings
	  Rquery = new Query();
	  Rquery.returnGeometry = false;
	  Rquery.outFields = ["FULLNAME"];
	  //Rquery.relationshipId = 0;

	  //on(dom.byId("execute"), "click", execute);

	  execute = function execute(parcelPIN) {
	    query.where = "PRPID = " + parcelPIN;
	    Rquery.where = "ADDPTKEY = " + parcelPIN;
	    //execute query
	    queryTask.execute(query, showResults, function (err) {
	    	console.log("query error:", err);
	    });
	    
	    //Rquery. = [parcelPIN];
	    RqueryTask.execute(Rquery, showResultsRquery, function (err) {
	    	console.log("query error:", err);
	    });
	  }

	  // map query results to building info form
	  function showResults(results) {
			//console.log("Some results:", results);
			if (results.features.length == 1) {
				var featureAttributes = results.features[0].attributes;
				for (var att in featureAttributes) {
	        if (att == "Short_Desc") $("#legalDes").val(featureAttributes[att]);
	        else if (att == "SNID") $("#section").val(featureAttributes[att]);
	        else if (att == "TNID") $("#twp").val(featureAttributes[att]);
	        else if (att == "RNID") $("#range").val(featureAttributes[att]);
	        else if (att == "MCD") $("#townV").val(featureAttributes[att]);
	      }
	      // alert user to updated fields
	      $("#fieldUpdate").text("Some fields have been filled in based on your Tax ID. Please fill in the remaining fields.")
			} else {
				console.log(results.features.length);
			}
		}

		// map relationship query results to building info form
	  function showResultsRquery(results) {
			console.log("Some Rquery results:", results);
			if (results.features.length == 1) {
				var featureAttributes = results.features[0].attributes;
				for (var att in featureAttributes) {
	        if (att == "FULLNAME") $("#roadName").val(featureAttributes[att]);
	      }
			} else {
				console.log(results.features.length);
			}
		}
	})


	////////////////////////////////////////////////////
	// Pass Data to LocalStorage when user is done entering info
	function updateLocalStore () {
		if (localStorage) {
			localStorage["applicantInfo"] = JSON.stringify(applicantInfo);
			localStorage["ownerInfo"] = JSON.stringify(ownerInfo);
			localStorage["buildingInfo"] = JSON.stringify(buildingInfo);
		}
	}



});