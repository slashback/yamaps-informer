ymaps.ready(init);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function init() {
  var myMap = new ymaps.Map("map", {
          center: [55.902109,37.696444],
          zoom: 13
      }, {
          searchControlProvider: 'yandex#search'
      });
      var routeParam = getParameterByName('route');
      var waypoints = JSON.parse(routeParam)

    ymaps.route(waypoints).then(function (route) {
        result = route.getJamsTime()
        console.log(result)
        document.body.innerHTML = '<div id="result">' + result + '</div>'
    });
}
