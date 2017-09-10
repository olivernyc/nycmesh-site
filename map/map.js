var map;

function initMap() {
  var styles = [
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#CCCCCC"
        }
      ]
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#f5f5f5"
        }
      ]
    },
    {
      featureType: "administrative",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "poi",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#ffffff"
        }
      ]
    },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "road.highway",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#dadada"
        }
      ]
    },
    {
      featureType: "transit",
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#d9d9d9"
        }
      ]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e"
        }
      ]
    }
  ];
  var styledMap = new google.maps.StyledMapType(styles, { name: "Styled Map" });

  var mapOptions = {
    center: { lat: 40.7281809, lng: -73.9595798 },
    zoom: 13,
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: false,
    streetViewControl: false,
    mapTypeControl: false
  };

  var map = new google.maps.Map(document.getElementById("map-div"), mapOptions);
  map.mapTypes.set("map_style", styledMap);
  map.setMapTypeId("map_style");

  var activeNodesLayer = new google.maps.Data();
  var potentialNodesLayer = new google.maps.Data();
  var linksLayer = new google.maps.Data();
  var linkNYCLayer = new google.maps.Data();
  // var beamsLayer = new google.maps.Data();
  activeNodesLayer.loadGeoJson("./nodes/active.json");
  potentialNodesLayer.loadGeoJson("./nodes/potential.json");
  linksLayer.loadGeoJson("./nodes/links.json");
  linkNYCLayer.loadGeoJson("./nodes/linkNYC.json");


  //changing icon opacity to show it has panoramas, also set supernode icon
  activeNodesLayer.setStyle(function(feature) {
    var url = "../assets/images/active.svg";
    var opacity = 0.5;
    var notes = feature.getProperty("notes").toLowerCase();
    if (notes.indexOf("supernode") !== -1) {
      url = "../assets/images/supernode.svg";
    }
    if (feature.getProperty("panoramas")) {
      //url = '../assets/images/activepano.svg';
      opacity = 1;
    }
    return {
      scaledSize: new google.maps.Size(50, 50),
      title: feature.getProperty("id"),
      opacity: opacity,
      zIndex: 200,
      icon: {
        url: url,
        anchor: new google.maps.Point(10, 10)
      }
    };
  });

  potentialNodesLayer.setStyle(function(feature) {
    var url = "../assets/images/potential.svg";
    var opacity = 0.5;
    var notes = feature.getProperty("notes").toLowerCase();
    if (notes.indexOf("supernode") !== -1) {
      url = "../assets/images/supernode-potential.svg";
    }
    if (feature.getProperty("panoramas")) {
      //url = '../assets/images/potentialpano.svg';
      opacity = 1;
    }
    return {
      scaledSize: new google.maps.Size(50, 50),
      title: feature.getProperty("id"),
      opacity: opacity,
      zIndex: 100,
      icon: {
        url: url,
        anchor: new google.maps.Point(10, 10)
      }
    };
  });

  linksLayer.setStyle(function(link) {
    var strokeColor = "#ff3b30";
    var opacity = 0.5;
    if (link.getProperty("status") != "active") {
      strokeColor = "gray";
      opacity = 0.25;
    }
    return {
      zIndex: 999,
      strokeWeight: 3,
      strokeColor: strokeColor,
      strokeOpacity: opacity
    };
  });

  linkNYCLayer.setStyle(function(feature) {
    var url = "../assets/images/linkNYC.svg";
    var opacity = 0.5;
    return {
      scaledSize: new google.maps.Size(50, 50),
      title: feature.getProperty("id"),
      opacity: opacity,
      zIndex: 9,
      icon: {
        url: url,
        anchor: new google.maps.Point(10, 10)
      }
    };
  });

  var infowindow = new google.maps.InfoWindow();
  activeNodesLayer.addListener("click", openInfoWindow);
  potentialNodesLayer.addListener("click", openInfoWindow);

  linksLayer.setMap(map);
  linkNYCLayer.setMap(map);
  potentialNodesLayer.setMap(map);
  activeNodesLayer.setMap(map);

  function openInfoWindow(event) {
    // replace this with a fully custom overlay
    var content = "<div class='pv3'>";
    content +=
      "<h2 class='di pr2'>Node " +
      event.feature.f.id +
      "" +
      event.feature.f.otherNodes +
      "</h2>";

    if (event.feature.f.status == "Installed") {
      content +=
        "<h3 class='di green fw4'>Active</h3><br>" + event.feature.f.notes;
    } else {
      content +=
        "<h3 class='di gray fw4'>Potential</h3><br>" + event.feature.f.notes;
    }

    content += "</div>";

    var panoramas = event.feature.f.panoramas;
    if (panoramas) {
      content +=
        "<h4 class='pb2 mv0 mb3 near-black fw4'>View from this node:</h3>";
      for (var i = 0; i < panoramas.length; i++) {
        var image =
          "<div class='w6'>" +
          "<a href='" +
          "../panorama/" +
          panoramas[i] +
          "'>";
        image +=
          "<img class='w-100 h-100 contain' src='" +
          "../panorama/" +
          panoramas[i] +
          "'></img>";
        image += "</a>" + "</div";

        content += image;
      }
    }
    infowindow.setContent(content);
    infowindow.setPosition(event.feature.getGeometry().get());
    infowindow.setOptions({ pixelOffset: new google.maps.Size(-1, -8) });
    infowindow.open(map);
    setTimeout(infowindow.open(map), 10000); // needs a timeout delay to force the autoscroll !!
  }
}
