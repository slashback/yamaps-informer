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
  }

    ymaps.route(routes.borisovka).then(function (route) {
        result = route.getHumanJamsTime().replace(/&#160;/g, ' ')
        console.log(result)
        document.getElementById('borisovka').innerHTML = result
    });

    ymaps.route(routes.ubileynaya).then(function (route) {
        result = route.getHumanJamsTime().replace(/&#160;/g, ' ')
        console.log(result)
        document.getElementById('ubileynaya').innerHTML = result
    });

    ymaps.route(routes.perlovka).then(function (route) {
        result = route.getHumanJamsTime().replace(/&#160;/g, ' ')
        console.log(result)
        document.getElementById('perlovka').innerHTML = result
    });


}
