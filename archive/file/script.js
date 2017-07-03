$(document).ready(function() {

    $body = $("body");

    var ajaxLoadTimeout;

    $(document).ajaxStart(function() {
        ajaxLoadTimeout = setTimeout(function() {
            $body.addClass("loading");
        }, 500);

    }).ajaxStop(function() {
        clearTimeout(ajaxLoadTimeout);
        $body.removeClass("loading")
    });

    $("#search").click(function() {
        updateStopData();
    });

    $(document).bind('keypress', function(e) {
        if (e.keyCode == 13) {
            updateStopData();
        }
    });

    $('#search').attr('disabled', true);
    $('#stop_id').keyup(function() {
        if ($(this).val().length != 0)
            $('#search').attr('disabled', false);
        else
            $('#search').attr('disabled', true);
    })

    $("#getlocation").click(function() {
        getLocation();
    });
});

function getLocation() {
    var options = {
      // enableHighAccuracy: true,
      // timeout: 5000,
      maximumAge: 0
    };

    function success(pos) {
      var position = pos.coords;
      console.log(`Latitude : ${position.latitude}`);
      console.log(`Longitude: ${position.longitude}`);
      console.log(`More or less ${position.accuracy} meters.`);
      chooseStop(position.latitude, position.longitude);
    };

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
}

function chooseStop(lat, lng) {
    $("#stop_picker").dialog("open");

    var wWidth = $(window).width();
    var dWidth = wWidth * 0.95;
    var wHeight = $(window).height();
    var dHeight = wHeight * 0.95;

    $("#stop_picker").dialog({
        autoOpen: false,
        modal: true,
        width: dWidth,
        height: dHeight
        //close: function
    });

    $("#stop_picker").append($("<div id='stoppickermap' style='height: 100%; width:100%;'></div>"));
    getStopPickerMap(lat, lng);
}

var mapstyles = [
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{
            "visibility": "off"
        }]
    },
    {
        "featureType": "poi",
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

function getStopPickerMap(lat, lng) {
    var map;
    var lat = lat;
    var lng = lng;
    initialize(lat, lng);

      function initialize(lat,lng) 
      {
        console.log(lat, lng);
        var origin = new google.maps.LatLng(lat,lng);
       
        map = new google.maps.Map(document.getElementById('stoppickermap'), {
          center: origin,
          zoom: 15,
          styles: mapstyles
        });
        
        var request = {
          location: origin,
          radius: 500,
          types: ['bus_station']
        };

        service = new google.maps.places.PlacesService(map);
        service.search(request, callback);
      }

      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            console.log(results[i]);
            createMarker(results[i]);
          }
        }
      }

      function createMarker(place) {
      
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          icon: 'file/pole32.png'
        });
      }
}


// maps api key AIzaSyDnJ6YfjWb7bDBtJl9OyGHzJybd6C7n0E
function drawMap(lat, lng) {

    //$("#map").append($('<div id="map" class="mdl-shadow--2dp remove"></div>'));
    $( "#map" ).height( 176 );

    var location = {
        lat: lat,
        lng: lng
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: location,
        styles: mapstyles
    });

    console.log("map initialized");

    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: 'file/pole32.png'
    });
    map.panTo(location);
}


function refresh() {
    $(".remove").remove()
    $("#results_table").remove();
    $("#stop_number").remove();
    $("#stop_name").remove();
    $("#initial_stop_name").remove();
    $(".mdl-chip").remove();
    $("#dialog").dialog("close");
    results_table = '<table id="results_table" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%;"><thead><tr><th class="mdl-data-table__cell--non-numeric">Bus</th><th class="mdl-data-table__cell--non-numeric">Destination</th><th class="mdl-data-table__cell--non-numeric">Due in</th></tr></thead><tbody id="row_results"></tbody></table>';
    $("#results_body").append(results_table);
}

function updateStopData() {
    refresh();
    stop_id = $("#stop_id").val();
    getBusInfo(stop_id);
    getStopInfo(stop_id);
}

function clickThroughToStop(stop_id) {
    refresh();
    stop_id = stop_id;
    getBusInfo(stop_id);
    getStopInfo(stop_id);

}

function getBusInfo(stop_id) {
    $.ajax({
        type: "GET",
        url: "https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + stop_id + "&format=json",
        dataType: "json",
        success: processBusData,
        error: function() {
            console.log("failed to retrieve bus info");
        }
    });
}

function getStopInfo(stop_id) {
    var stop = (stop_id != '' ? stop_id : 0);
    $.ajax({
        type: "GET",
        url: "https://data.dublinked.ie/cgi-bin/rtpi/busstopinformation?stopid=" + stop + "&format=json",
        dataType: "json",
        success: processStopData,
        error: function() {
            console.log("failed to retrieve stop info");
        }
    });
}

function getRouteInfo(route_id) {
    $.ajax({
        type: "GET",
        url: "https://data.dublinked.ie/cgi-bin/rtpi/routeinformation?routeid=" + route_id + "&operator=bac&format=json",
        dataType: "json",
        success: processRouteData,
        error: function() {
            console.log("failed to retrieve route info");
        }
    });
}

function processBusData(data) {
    $("#bus_info").html('<span id="stop_number">Stop Number: ' + data.stopid + '</span><div class="mdl-layout-spacer"></div><div class="mdl-layout-spacer"></div><div>Last updated: ' + data.timestamp + '</div');
    $("#results_table").append($("<div id='response'></div>"))

    if (data.errormessage == 'No Results') {
        console.log(data.errormessage);
        $("#row_results").append($('<tr><td colspan="3" style="text-align:center; ">No busses found! ☹</td></tr>'));
    };

    $.each(data.results, function(i, v) {
        duetime_suffix = (v.duetime != 'Due' ? " min" : "");
        retard = (v.duetime - v.departureduetime);
        $("#row_results").append($('<tr><td class="mdl-data-table__cell--non-numeric">' + v.route + '</td><td class="mdl-data-table__cell--non-numeric">' + v.destination + '</td><td class="mdl-data-table__cell--non-numeric">' + v.duetime + '' + duetime_suffix + '</td></tr>'));
    });

}


function processStopData(data) {
    if (data.errormessage == 'No Results') {
        console.log(data.errormessage);
        $("#bus_stop_name").append($('<span id="stop_name">Not found.</span>'));
    };
    $.each(data.results, function(i, v) {
        stop_name = (v.shortname != '' ? v.shortname : "Not found.");
        $("#bus_stop_name").append($('<span id="stop_name"><strong>' + stop_name + '</strong></span>'));
        lat = parseFloat(v.latitude);
        lng = parseFloat(v.longitude);
        drawMap(lat, lng);

        maps_url = "https://www.google.ie/maps/?q=" + v.latitude + "," + +v.longitude
        maps_html = "<button class='remove mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect' onclick=\"window.location.href='" + maps_url + "'\"><i class='material-icons'>directions</i></button>"
        $("#links").append($(maps_html));
        $.each(v.operators, function(i, v) {
            $.each(v.routes, function(i, v) {
                $("#chips").append($('<span class="mdl-chip chip" style="margin:3px; background-color:#FFEB3B;" onclick="listenToChips(\'' + v + '\')"><span class="mdl-chip__text">' + v + '</span></span>'));
            });
        });
    });

}

function listenToChips(data) {
    loader = '<div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>';
    getRouteInfo(data);

}

function processRouteData(data) {
    $("#dialog").dialog("open");

    var wWidth = $(window).width();
    var dWidth = wWidth * 0.95;
    var wHeight = $(window).height();
    var dHeight = wHeight * 0.95;

    $("#dialog").dialog({
        autoOpen: false,
        modal: true,
        width: dWidth,
        height: dHeight,
        close: function() {
            $(".route_results").remove();
        },
    });
    $("#tabs").tabs();

    //$(".ui-dialog-title").hide();
    //$( ".ui-tabs-nav" ).append($(".ui-dialog-titlebar-close"));



    route1_results_table = '<table id="route1_results_table" class="route_results mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%;"><thead><tr><th>Stop ID</th><th class="mdl-data-table__cell--non-numeric">Stop name</th></tr></thead><tbody id="route1_results"></tbody></table>';

    route2_results_table = '<table id="route2_results_table" class="route_results mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%;"><thead><tr><th>Stop ID</th><th class="mdl-data-table__cell--non-numeric">Stop name</th></tr></thead><tbody id="route2_results"></tbody></table>';

    $("#tabs-1").append(route1_results_table);
    $("#tabs-2").append(route2_results_table);

    tab_1 = data.results[0];
    //$("#tab-1-title").text("To " + tab_1.destination);
    $.each(tab_1.stops, function(i, v) {
        $("#route1_results_table").append($('<tr><td>' + v.displaystopid + '</td><td class="mdl-data-table__cell--non-numeric">' + v.fullname + '</td></tr>'));
    });

    tab_2 = data.results[1];
    //$("#tab-2-title").text("To " + tab_2.destination);
    $.each(tab_2.stops, function(i, v) {
        $("#route2_results_table").append($('<tr><td>' + v.displaystopid + '</td><td class="mdl-data-table__cell--non-numeric">' + v.fullname + '</td></tr>'));
    });

    $('#route1_results_table tr').click(function() {
        var stop_id = $(this).closest('tr').find('td:first').text();
        clickThroughToStop(stop_id);
    });

    $('#route2_results_table tr').click(function() {
        var stop_id = $(this).closest('tr').find('td:first').text();
        clickThroughToStop(stop_id);
    });


}

