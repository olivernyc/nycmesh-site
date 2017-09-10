var map;
var currentNode = {};

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
    var opacity = 0.75;
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
        anchor: new google.maps.Point(10, 10),
        labelOrigin: new google.maps.Point(28, 10)
      },
        // label: {
        //   color: "#ff3b30",
        //   fontSize: "14",
        //   fontWeight: "bold",
        //   paddingLeft: "20",
        //   text: feature.getProperty("id"),
        // }
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
        anchor: new google.maps.Point(10, 10),
        labelOrigin: new google.maps.Point(28, 10)
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
  activeNodesLayer.addListener("click", showDetails);
  potentialNodesLayer.addListener("click", showDetails);

  linksLayer.setMap(map);
  linkNYCLayer.setMap(map);
  potentialNodesLayer.setMap(map);
  activeNodesLayer.setMap(map);
}

function showDetails(event) {
  var node = event.feature.f
  currentNode = node
  var infoWindow = document.getElementById('infoWindow')
  var statusString = node.id === 227 ? 'Supernode' : node.status || 'Potential'
  infoWindow.innerHTML = '<div class="flex items-center justify-between">'+'<h2 class="mv0 near-black">Node #'+node.id+'</h2>'+'<h3 class="mv0 '+statusString+'">'+statusString+'</h3>'+'</div>'
  if (node.notes) {
    infoWindow.innerHTML += '<p class="f5 fw5 gray">'+node.notes+'</p>'
  }
  if (node.roof) {
    infoWindow.innerHTML += '<p class="f5 fw5 green">'+'✓ Roof Access'+'</p>'
  }
  if (node.panoramas) {
    String(node.panoramas).split(',').forEach(function(panorama) {
      infoWindow.innerHTML += '<img class="w-100 mv2" src="/panorama/'+panorama+'"></img>'
    })
  }
  infoWindow.classList.add('db');
}

function hideDetails() {
  var infoWindow = document.getElementById('infoWindow')
  infoWindow.classList.remove('db');
}
