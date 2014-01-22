var map, bfBuildings, query;
// map layers
var bfBuildingDynamicLayer, bfParcelsDynamicLayer;
var bfLayers = [];
var parcelPIN = JSON.parse(localStorage.ownerInfo).parcelPIN;
console.log("parcel pin:", parcelPIN);
var bfServiceURL = "http://199.21.241.172/arcgis/rest/services/Bayfield/addressPts/MapServer/";

require([
      "dojo/_base/array",
      "dojo/_base/Color",
      "dojo/dom",
      "dojo/on",
      "dojo/parser",
      "dojo/ready",
      "esri/map",
      "esri/geometry/Point",
      "esri/graphic",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/FeatureLayer",
      "esri/layers/ImageParameters",
      "esri/dijit/Legend",
      "esri/symbols/PictureMarkerSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/tasks/query",
      "esri/layers/LabelLayer",
      "esri/symbols/TextSymbol",
      "esri/renderers/SimpleRenderer",
      "esri/dijit/LocateButton",
      "esri/dijit/BasemapToggle"],
function (arrayUtils, Color, dom, on, parser, ready, Map, Point, Graphic, ArcGISDynamicMapServiceLayer, FeatureLayer, ImageParameters, Legend, PictureMarkerSymbol, SimpleFillSymbol, Query, LabelLayer, TextSymbol, SimpleRenderer, LocateButton, BasemapToggle) {
  parser.parse();

  ready(function () {
    console.log('dojo ready');
    /*if (navigator.geolocation) {
      // if you want to track as the user moves setup navigator.geolocation.watchPostion
      navigator.geolocation.getCurrentPosition(initMap, locationError);
    }*/
		initMap();
  });

  function initMap(position) {
    // create the map
    map = new Map("map", {
      center :[-91.196136, 46.470468],
      zoom   : 15,
      basemap:"satellite"
    });
    map.setVisibility(false);  // initially hide map
    map.on("load", mapIsLoaded());

    // add basemap toggle
    var toggle = new BasemapToggle({
      map: map,
      basemap: "osm"
    }, "BasemapToggle");
    toggle.startup();

    var geoLocate = new LocateButton({
      map: map
    }, "LocateButton");
    geoLocate.startup();
  }
  function mapIsLoaded () {
    // set map zoom so that osm basemap always displays with data
    $("#BasemapToggle").click( function() {
      if (map.getBasemap() == "osm" && map.getZoom() == 19) map.setZoom(18);
    });

    // add reference layers
		
    // Loop through ref layers and add to map
    // 0:parcels  1:building sites  2:entrance sites
    // feature layer method
    for (var i=0; i < 3; i++) {
      bfLayers[i] = new FeatureLayer(bfServiceURL + i, {
        //outFields: ["MAILFNAME"],
        maxAllowableOffset: calcOffset()
      });
    }
    // dynamic layer method

    // used to generalize feature layer features
    function calcOffset() {
      if (map.extent) return (map.extent.getWidth() / map.width);
    }

    ///////////////////////////////////////////////////
    // SELECT PARCEL USING PARCEL PIN
    // add selected parcel layer
    var selParcel = new FeatureLayer("http://199.21.241.172/arcgis/rest/services/Bayfield/addressPts/MapServer/0", {
        mode: FeatureLayer.MODE_SELECTION
      });
    map.addLayer(selParcel);
    // create selection query
    var selParcelQuery = new Query();
    selParcelQuery.where = "PRPID = " + parcelPIN;
    var selParcelPromise = selParcel.selectFeatures(selParcelQuery, FeatureLayer.SELECTION_NEW, function (features) {
        console.log("selected features: ", features);
        // create selection symbol
        var selectionSymbol = new esri.symbol.SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL);
        // set outline
        selectionSymbol.setOutline(new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([0,242,255]), 3));
        // if only one feature returned from query
        // add feature to map and center map on feature
        if (features.length == 1) {  
          var parcel = features[0];
          parcel.setSymbol(selectionSymbol);
          map.graphics.add(parcel);
          map.setExtent(parcel._extent);
          console.log(parcel._extent);
        } else {
          console.log(features.length);
        }

        // add ref layers
        map.addLayers(bfLayers);

    }, function (err) {
      console.log("select features error: ", err);
    });
    // show map after parcel has been selected
    selParcelPromise.then(map.setVisibility(true));

    /*//////////////////////////////////////////////////////////////
    // LABEL LAYER
    // create a text symbol to define the style of labels
    var parcelLabel = new TextSymbol().setColor("#FFFFFF");
    parcelLabel.font.setSize("14pt");
    parcelLabel.font.setFamily("arial");
    parcelLabelRenderer = new SimpleRenderer(parcelLabel);
    var labels = new LabelLayer({ id: "labels" });
    // tell the label layer to label the countries feature layer 
    // using the field named "admin"
    labels.addFeatureLayer(bfLayers[2], parcelLabelRenderer, "${MAILFNAME}");
    // add the label layer to the map
    map.addLayer(labels);*/






    //zoomToLocation(position);
/*		map.on("layers-add-result", function (evt) {
      // add legend
			var layerInfo = arrayUtils.map(evt.layers, function (layer, index) {
				return {layer:layer.layer, title:layer.layer.name};
			});
			if (layerInfo.length > 0) {
				var legendDijit = new Legend({
					map: map,
					layerInfos: layerInfo
				}, "legendDiv");
				legendDijit.startup();
			}

      console.log(evt.layers);
		});*/

    //initialize the geocoder
    //locator = new Locator("http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer");
    //on(locator, "onAddressToLocationsComplete", showResults);
  /*
      // listen for geolocate button click
      on(dom.byId("geolocate"), "click", getLocation);
    }

    // locates user's current position
    function getLocation() {
      console.log("getLocation");
      if (navigator.geolocation) {
        //$.mobile.showPageLoadingMsg();
        //true hides the dialog
        //if you want to track as the user moves setup navigator.geolocation.watchPostion
        navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
      }
    }

    // error callback for getLocation
    function locationError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log("Location not provided");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("Current location not available");
          break;
        case error.TIMEOUT:
          console.log("Timeout");
          break;
        default:
          console.log("unknown error");
          break;
      }
    }

    // callback to add graphic at user's current position
    function zoomToLocation(position) {
      console.log("zoomToLocation");
      $.mobile.hidePageLoadingMsg(); //true hides the dialog
      var pt = esri.geometry.geographicToWebMercator(new Point(position.coords.longitude, position.coords.latitude));
      map.centerAndZoom(pt, 13);
      //uncomment to add a graphic at the current location
      var symbol = new PictureMarkerSymbol("images/bluedot.png", 40, 40);
      map.graphics.add(new Graphic(pt, symbol));
      console.dir(position);
    }*/

    ////////////////////////////////////////////////////
    //  TOC / LEGEND
    // update layer visibility from table of contents
    // feature layer method
    $( '#parcelToggle' ).change(function() {
      if (this.checked) bfLayers[0].setVisibility(true);
      else bfLayers[0].setVisibility(false);
    });
    $( '#addressSiteToggle' ).change(function() {
      if (this.checked) bfLayers[1].setVisibility(true);
      else bfLayers[1].setVisibility(false);
    });
    $( '#addressEntToggle' ).change(function() {
      if (this.checked) bfLayers[2].setVisibility(true);
      else bfLayers[2].setVisibility(false);
    });
    // dynamic layer method
    /*$( ".tocToggle" ).on( "slidestop", function( event ) {
      console.log(event);
      //console.log(ui);
      visible = [];
      
      // check if address layer toggles are on
      if ($('#addressSiteToggle').val() == "on") {
        visible.push(0);
      }
      if ($('#addressEntToggle').val() == "on") {
        visible.push(1);
      }

      //if there aren't any layers visible set the array value to = -1
      if(visible.length === 0){
        visible.push(-1);
      }

      bfBuildingDynamicLayer.setVisibleLayers(visible); //update address point layer visibility

      //update parcel layer visibility
      if ($('#parcelToggle').val() == "on") {              
        bfParcelsDynamicLayer.setVisibility(true); 
      } else bfParcelsDynamicLayer.setVisibility(false);
    } );*/ 
    
    $.get("http://199.21.241.172/arcgis/rest/services/Bayfield/addressPts/MapServer/legend?f=pjson", function (data, status) {
      //console.log("Data: " + data + "\nStatus: " + status);
      var legendJson = JSON.parse(data);
      console.log(legendJson);
      $.each(legendJson.layers, function (index, value) {
        var imgUrl = bfServiceURL + "/" + index + "/" + this.legend[0].url;
        var imgEl = $("<img>").attr("src", imgUrl);
        $("#tocPopup input:eq(index)").after(imgEl);
      })
    })

  }
})
