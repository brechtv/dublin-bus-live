$(document).ready(function() {
    $progressbar = $("#progressbar");

    var a;
    $(document).ajaxStart(function() {
        a = setTimeout(function() {
            $progressbar.addClass("loading");
        }, 0)
    }).ajaxStop(function() {
        clearTimeout(a);
        $progressbar.removeClass("loading");
    });

    $("#input").keypress(function(a) {
        if (a.keyCode == 13) {
            triageInput($("#input").val());
        }
    });

    // extract stop id from url
    var stop_id_param = getParameterByName('stop_id');
    // if there is a stop id, open the stop
    if(stop_id_param) {
        clickThroughToStop(stop_id_param)
    }
    // function to extract param value
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

});

// TRIAGE INPUT
function triageInput(input) {
    input = input;
    fbw(input, "searches")
    var regex = /^[a-zA-Z]+$/;
    if (input.length <= 6 && !input.match(regex)) {
        for (var a = 0; a < bus_stops_array.length; a++) {
            if(bus_stops_array[a] === input) {
                clickThroughToStop(input);
                var ls_stops = [];
                localStorage.getItem("dbl_last_stops") == null ? ls_stops = [] : ls_stops = JSON.parse(localStorage.getItem("dbl_last_stops"));
                ls_stops.unshift(input);
                ls_stops = ls_stops.filter(function(item, pos, self) {
                        return self.indexOf(item) == pos;
                    })
                if(ls_stops.length > 5) {ls_stops.length = 5};
                localStorage.setItem("dbl_last_stops", JSON.stringify(ls_stops))
            }
        };
    } else {
        geocodeAddress(input);
    }
}

// IF INPUT IS ADDRESS
function addressSearch() {
    input = $("#input2").val();
    geocodeAddress(input)
}

function geocodeAddress(input) {
    address = input + ", Dublin, Ireland";
    (new google.maps.Geocoder).geocode({
        address: address
    }, function(a, b) {
        "OK" === b ? chooseStop(a[0].geometry.location.lat(), a[0].geometry.location.lng()) : (console.log("Geocode was not successful for the following reason: " + b), alert("Could not find address! Try a different query."))
    })
}

// CREATE MODAL
function chooseStop(a, c) {
    $("#overlay").addClass("map_overlay");
    $("#stop_picker").dialog("open");
    var b = 0.95 * $(window).width(),
        d = 0.95 * $(window).height();
    $("#stop_picker").dialog({
        modal: !0,
        width: b,
        height: d,
        close: function() {
            $("#overlay").removeClass("map_overlay")
        }
    });

    $(window).resize(function() {
        var wWidth = $(window).width();
        var dWidth = wWidth * 0.95;
        var wHeight = $(window).height();
        var dHeight = wHeight * 0.95;
        $("#stop_picker").dialog("option", "width", dWidth);
        $("#stop_picker").dialog("option", "height", dHeight);
    });


    $("#stop_picker").append($("<div id='stoppickermap' class='remove' style='height: 100%; width:100%;'></div>"));
    getStopPickerMap(a, c)
}

// CREATE MAP FOR MODAL
function getStopPickerMap(a, c) {
    var b, d = new google.maps.LatLng(a, c);
    b = new google.maps.Map(document.getElementById("stoppickermap"), {
        center: d,
        zoom: 17,
        styles: mapstyles,
        gestureHandling: 'greedy'
    });
    var f;
    $.each(bus_stops_extd, function(a, e) {
        busstop_pos = new google.maps.LatLng(e.lat, e.lng);
        if (650 > google.maps.geometry.spherical.computeDistanceBetween(busstop_pos, d)) {
            var c = e.routes.split(","),
                g = "";
            $.each(c.slice(0, 10), function(a, b) {
                g += '<span class="mdl-chip" style="margin-right: 2px;background-color: #EF5350;color: white;"><span class="mdl-chip__text">' +
                    b + "</span></span>"
            });
            f = '<div class="mdl-card mdl-shadow--2dp" style=" border-radius: 5px; padding: 10px;"><div><p style="font-size: 16px;"><strong>' + e.stopname + "</strong> - stop id: " + e.stopid + "</p></div><div>" + g + '</div><div></div><br><a style="background-color: rgba(63, 81, 181, 1); color: white;" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick="clickThroughToStop(\'' + e.stopid + "')\">Live departures</a></div>";
            // var k = new google.maps.InfoWindow({
            //         content: f
            //     }),
                h = new google.maps.Marker({
                    position: busstop_pos,
                    map: b,
                    icon: "file/testpole1.png",
                    label: {
                        text: e.stopid,
                        fontWeight: "bold",
                        fontSize: "10px"
                    }
                });

                var boxText = f;

            var myOptions = {
                 content: boxText
                ,disableAutoPan: false
                ,maxWidth: 0
                ,pixelOffset: new google.maps.Size(25, -100)
                ,zIndex: null
                ,boxStyle: {
                  opacity: 0.95
                  ,width: "280px"
                 }
                ,closeBoxMargin: "10px 2px 2px 2px"
                ,closeBoxURL: "file/close-window.png"
                ,infoBoxClearance: new google.maps.Size(1, 1)
                ,isHidden: false
                ,pane: "floatPane"
                ,enableEventPropagation: false
            };

            google.maps.event.addListener(h, "click", function (e) {
                ib.open(b, this);
            });

            var ib = new InfoBox(myOptions);

            // h.addListener("click", function() {
            //     k.open(b, h)
            // })
        }
    });
    new google.maps.Marker({
        position: d,
        map: b
    })
}

// SELECT STOP
function clickThroughToStop(a) {
    refresh();
    getBusInfo(a);
    getStopInfo(a);

    // update url parameter with stop id
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?stop_id=' + a;
        window.history.pushState({path:newurl},'',newurl);
    }

}

// GET RT BUS INFO
function getBusInfo(a) {
        $.getJSON("https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + a + "&format=json", function(json) {
        // $.getJSON("https://bvcors.herokuapp.com/https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + a + "&format=json?callback?", function(json) {
            if (json.errorcode == 0) {
                processBusData(json)
            } else {
                console.log("failed to retrieve stop info")
            }
        });
}
function processBusData(a) {
    $("#bus_info").html('<span id="stop_number">Stop Number: ' + a.stopid + '</span><div class="mdl-layout-spacer"></div><div class="mdl-layout-spacer"></div><div>Last updated: ' + a.timestamp + "</div");
    $("#results_table").append($("<div id='response'></div>"));
    "No Results" == a.errormessage && (console.log(a.errormessage), $("#row_results").append($('<tr><td colspan="3" style="text-align:center; ">No busses found! \u2639</td></tr>')));
    $.each(a.results, function(a, b) {
        duetime_suffix = "Due" !=
            b.duetime ? " min" : "";
        retard = b.duetime - b.departureduetime;
        $("#row_results").append($('<tr><td class="mdl-data-table__cell--non-numeric">' + '<span class="mdl-chip chip" onclick="getRouteInfo(`' + b.route + '`);"><span class="mdl-chip__text">' + b.route + "</span></span>" +'</td><td class="mdl-data-table__cell--non-numeric">' + b.destination + '</td><td class="mdl-data-table__cell--non-numeric">' + b.duetime + "" + duetime_suffix + "</td></tr>"))
    })
}

// GET STOP INFO
function getStopInfo(a) {
    $.getJSON("https://data.smartdublin.ie/cgi-bin/rtpi/busstopinformation?stopid=" + a + "&format=json", function(json) {
    // $.getJSON("https://bvcors.herokuapp.com/https://data.dublinked.ie/cgi-bin/rtpi/busstopinformation?stopid=" + a + "&format=json?callback?", function(json) {
        if (json.errorcode == 0) {
            processStopData(json)
        } else {
            stopNotFound()
            console.log("failed to retrieve stop info")
        }
    });
}

function processStopData(a) {
    fbw(a.results[0].stopid, "stops")
    var ls_stops = [];
    localStorage.getItem("dbl_last_stops") == null ? ls_stops = [] : ls_stops = JSON.parse(localStorage.getItem("dbl_last_stops"));
    ls_stops.unshift(a.results[0].stopid);
    ls_stops = ls_stops.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
    if(ls_stops.length > 5) {ls_stops.length = 5};
    localStorage.setItem("dbl_last_stops", JSON.stringify(ls_stops))



    "No Results" == a.errormessage && (console.log(a.errormessage), $("#bus_stop_name").append($('<span id="stop_name">Not found.</span>')));
    $.each(a.results, function(a, b) {
        stop_name = "" != b.shortname ? b.shortname : "Not found.";
        $("#bus_stop_name").append($('<span id="stop_name"><strong>' + stop_name + '</strong></span><span class="remove" style="margin-left: 5px"><button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" onclick="clickThroughToStop(' + b.stopid + ')"><i class="material-icons">refresh</i></button></span> <span class="remove" style="margin-left: 5px"><button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" onclick="location.href = `index.html`;"><i class="material-icons">home</i></button></span>'));
        lat = parseFloat(b.latitude);
        lng = parseFloat(b.longitude);
        stop_info = {id: b.displaystopid, name: b.fullname, name_irish: b.shortnamelocalized, shortname: b.shortname, lat: parseFloat(b.latitude), lng: parseFloat(b.longitude)}
        drawMap(lat, lng, stop_info);
        maps_url = "https://www.google.ie/maps/?q=" + b.latitude + "," + +b.longitude;
        maps_html = "<button class='remove mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect' onclick=\"window.location.href='" +
            maps_url + "'\"><i class='material-icons'>directions</i></button>";
        $("#links").append($(maps_html));
        $.each(b.operators, function(a, b) {
            $.each(b.routes, function(a, b) {
                $("#chips").append($(
                    '<span class=" mdl-chip chip" onclick="getRouteInfo(`' + b +
                    '`);"><span class="tooltip mdl-chip__text">' + b + `<span class="tooltiptext">Click to see route map</span></span></span>`)
                )
            })
        })
        $("#input2").keypress(function(a) {
            if (a.keyCode == 13) {
                triageInput($("#input2").val());
            }
        });
    })
}

function stopNotFound() {

    $("#bus_stop_name").append($('<span id="stop_name"> <strong>Not found.</strong> :(</span><span class="remove" style="margin-left: 5px"><button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" onclick="location.href = `index.html`;"><i class="material-icons">home</i></button></span>'));
    $("#bus_info").html('<span id="stop_number">Bus stop might have moved, been renamed, or is no longer in use.</span><div class="mdl-layout-spacer"></div><div class="mdl-layout-spacer"></div>');

}


function getRouteInfo(a) {
    $.getJSON("https://data.smartdublin.ie/cgi-bin/rtpi/routeinformation?routeid=" + a + "&operator=bac&format=json", function(json) {
        if (json.errorcode == 0) {
            processRouteInfo(json)
        } else {
            console.log("failed to retrieve stop info")
        }
    });
}

function processRouteInfo(a) {

 try {
    var dot = {
        path: 'M-1,0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',
        fillColor: '#3F51B5' ,
        fillOpacity: 0.75,
        scale: 3,
        strokeColor: '#3F51B5',
        strokeWeight: 2
      };

    $("#map").height(400);

    d = new google.maps.Map(document.getElementById("map"), {
            zoom: 11,
            styles: mapstyles_nolabel
        });

    $.each(a.results, function(i, v) {

    var markers = [];

    if (i ==0) {
        $.each(v.stops, function (w, x) {

            a = parseFloat(x.latitude)
            c = parseFloat(x.longitude)
            b = { lat: a, lng: c }


        if(w % 10 == 0) {
                h = new google.maps.Marker({
                    position: b,
                    map: d,
                    icon: "file/testpole1.png",
                    label: {
                        text: x.stopid,
                        fontWeight: "bold",
                        fontSize: "10px"
                    }
                });
                markers.push(h)
            } else {
            g = new google.maps.Marker({
                position: b,
                map: d,
                icon: dot
            });
            markers.push(g)
        }
        })

        points = []

    var bound = new google.maps.LatLngBounds();
    for (var i in markers) {
        bound.extend(markers[i].getPosition());
    }
    d.fitBounds(bound);

}
    })
} catch(err) {

}

}

// DRAW MAP
function drawMap(a, c, stop_info) {
    $("#map").height(176);
    var b = {
            lat: a,
            lng: c
        },
        d = new google.maps.Map(document.getElementById("map"), {
            zoom: 17,
            center: b,
            styles: mapstyles
        });
    (new google.maps.TransitLayer).setMap(d);


    h = new google.maps.Marker({
        position: b,
        map: d,
        icon: "file/pole32.png"
    });

    s = new google.maps.LatLng(53.349826, -6.260240);
    t = new google.maps.LatLng(a, c);
    var x = google.maps.geometry.spherical.computeDistanceBetween(s, t)
    distance_to_spire = (x/1000).toFixed(1)
    html = `<div class="mdl-card mdl-shadow--2dp" style=" border-radius: 5px;">
            <div class="mdl-card__supporting-text">
            <h5 class="mdl-card__title-text" style="margin-bottom: 0px; color: #3F51B5; font-family: 'Roboto Slab', serif;">` + stop_info.id + ` - ` + stop_info.name + `</h5>
            <p>` + stop_info.shortname + ` (` + stop_info.name_irish + `)</p>
            <p>` + distance_to_spire  + `km from city center</p>
          </div>
          </div>
        </div>`

    var boxText = html;

    var myOptions = {
             content: boxText
            ,disableAutoPan: true
            ,maxWidth: 0
            ,pixelOffset: new google.maps.Size(25, -100)
            ,zIndex: null
            ,boxStyle: {
              opacity: 0.75
              ,width: "280px"
             }
            ,closeBoxMargin: "10px 2px 2px 2px"
            ,closeBoxURL: "https://www.google.com/intl/en_us/mapfiles/close.gif"
            ,infoBoxClearance: new google.maps.Size(1, 1)
            ,isHidden: false
            ,pane: "floatPane"
            ,enableEventPropagation: false
        };

        google.maps.event.addListener(h, "click", function (e) {
            ib.open(d, this);
        });

        var ib = new InfoBox(myOptions);

    d.panTo(b)
}

// REFRESH UI
function refresh() {
    $(".remove").remove();
    $("#results_table").remove();
    $("#stop_number").remove();
    $("#stop_name").remove();
    $("#initial_stop_name").remove();
    $(".mdl-chip").remove();
    $("#dialog").dialog("close");
    $("#stop_picker").dialog("close");
    results_table = '<table id="results_table" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%;"><thead><tr><th class="mdl-data-table__cell--non-numeric">Bus</th><th class="mdl-data-table__cell--non-numeric">Destination</th><th class="mdl-data-table__cell--non-numeric">Due in</th></tr></thead><tbody id="row_results"></tbody></table>';
    $("#results_body").append(results_table)
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
    },
    {
        "featureType": "water",
        "stylers": [{
            "color": "#2196f3"
        }]
    }
];

var mapstyles_nolabel = [
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {
        "color": "rgba(63, 81, 181, 0.8)"
      }
    ]
  }
]
