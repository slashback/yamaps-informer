ymaps.ready(init);

function init() {
  var myMap = new ymaps.Map("map", {
          center: [55.902109,37.696444],
          zoom: 13
      }, {
          searchControlProvider: 'yandex#search'
      });

  var routes = {
    borisovka: [
      { point: [55.908830,37.711122], type: 'wayPoint' },
      { point: [55.906679,37.706000], type: 'wayPoint' },
      { point: [55.886758,37.661844], type: 'wayPoint' },
    ],
    ubileynaya: [
      { point: [55.908830,37.711122], type: 'wayPoint' },
      { point: [55.912400,37.716707], type: 'wayPoint' },
      { point: [55.886758,37.661844], type: 'wayPoint' },
    ],
    perlovka: [
      { point: [55.908830,37.711122], type: 'wayPoint' },
      { point: [55.900769,37.739418], type: 'wayPoint' },
      { point: [55.886758,37.661844], type: 'wayPoint' },
    ],
    volkovskoe: [
      { point: [55.887631,37.661952], type: 'wayPoint' },
      { point: [55.911327,37.671437], type: 'wayPoint' },
      { point: [55.908830,37.711122], type: 'wayPoint' },
    ],

  }

    ymaps.route(routes.borisovka).then(function (route) {
        result = route.getJamsTime()
        console.log(result)
        document.getElementById('borisovka').innerHTML = '<div id="bor-result">' + result + '</div>'
    });

    ymaps.route(routes.ubileynaya).then(function (route) {
        result = route.getJamsTime()
        console.log(result)
        document.getElementById('ubileynaya').innerHTML = '<div id="you-result">' + result + '</div>'
    });

    ymaps.route(routes.perlovka).then(function (route) {
        result = route.getJamsTime()
        console.log(result)
        document.getElementById('perlovka').innerHTML = '<div id="per-result">' + result + '</div>'
    });
    
    ymaps.route(routes.volkovskoe).then(function (route) {
        result = route.getJamsTime()
        console.log(result)
        document.getElementById('volkovskoe').innerHTML = '<div id="vol-result">' + result + '</div>'
    });



}
