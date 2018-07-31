$(function() {
    drawAllStops()
});



// draw FULL map
function drawAllStops() {
    var dot = {
        path: 'M-1,0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',
        fillColor: 'yellow',
        fillOpacity: 1,
        scale: 16,
        strokeColor: 'black',
        strokeWeight: 2
    };

    $("#fullmap").height(400);

    d = new google.maps.Map(document.getElementById("fullmap"), {
        zoom: 9,
        gestureHandling: 'greedy',
        styles: mapstyles,
        center:{lat: 53,lng: -6}
    });

    var markers = [];
    $.each(bus_stops_extd, function(i, v) {

    if (i < 100000) {
        a = parseFloat(v.lat)
        c = parseFloat(v.lng)
        b = {lat: a,lng: c}

        h = new google.maps.Marker({
            position: b,
            map: d,
            icon: dot,
            label: {
                text: v.stopid,
                fontWeight: "bold",
                fontSize: "10px"
            }
        });

        h.addListener('click', function() {
          location.href = `index.html?stop_id=` + v.stopid
        });

        markers.push(h)
    }

    });

    var bound = new google.maps.LatLngBounds();
    for (var i in markers) {
        bound.extend(markers[i].getPosition());
    }
    d.fitBounds(bound);
    var markerCluster = new MarkerClusterer(d, markers,
        {imagePath: 'file/markerclusterer/m',
        gridSize: 25});

    $("#maploading").remove()
    $("#fullmap").show()

}
var mapstyles = [{
        "featureType": "poi.business",
        "stylers": [{
            "visibility": "off"
        }]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    },
    {
        "featureType": "transit",
        "stylers": [{
            "visibility": "on"
        }]
    }
];

