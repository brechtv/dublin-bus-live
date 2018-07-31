$(document).ready(function() {

  $(".mdl-crumbs").append(`
    <div class="newsheader-card-wide mdl-card mdl-shadow--2dp remove">
      <div class="mdl-card__actions mdl-card--border">
          <h2 class="mdl-card__title-text" style="padding: 10px; border-radius: 5px;"><span style="color: #3F51B5;"><strong>Hear hear!</strong></span></h2>
      </div>
       <div class="mdl-card__supporting-text">
          <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="load_news" onclick="loadNews()">
              Show announcements
            </button>
          </div>
        <div class="newsfeeds mdl-card__actions mdl-card--border">
          </div>

  </div>
`)
});

function loadNews() {
  $(".newsfeeds").html("")
  var feed = "https://bvcors.herokuapp.com/https://www.dublinbus.ie/RSS/Rss-news/";
  $.ajax(feed, {
    accepts:{
      xml:"application/rss+xml"
    },
    dataType:"xml",
    success:function(data) {
      $(data).find("item").each(function (i, v) {
      if (i < 5) {
        var el = $(v);
        card = `
        <div class="news-card-wide mdl-card mdl-shadow--2dp remove">
          <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">` + el.find("title").text() + `</h2>
          </div>
          <div class="mdl-card__supporting-text">
            ` + el.find("description").text() + `
          </div>
          <div class="mdl-card__actions mdl-card--border">
            <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" href="` + el.find("link").text() + `">
              Read more
            </a>
          </div>

        </div>`
        console.log(el);

        $(".newsfeeds").append(card)
      }
      });


    }
  });
}
