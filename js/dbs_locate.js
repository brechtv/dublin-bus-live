$progressbar = $("#progressbar");

$( "#locate" ).click(function() {
  getLocation()
});

$( "#locate_banner" ).click(function() {
  getLocation()
});

function getLocation() {
    fbw("location requested", "searches")
    $progressbar.addClass("loading");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              chooseStop(lat, lng)
              $progressbar.removeClass("loading");
        },
        function (error) {
          if (error.code == error.PERMISSION_DENIED)
              alert("Location services denied, please allow location services for this functionality.")
              $progressbar.removeClass("loading");
        });
    } else {
      alert("Could not find location!")
    }

}
