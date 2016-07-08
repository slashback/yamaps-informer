ymaps.ready(init);
function init() {
  var myMap = new ymaps.Map("map", {
    center: [55.902109,37.696444],
  });

  var routes = [
    {
      name: 'bor',
      points: [
        { point: [55.908830,37.711122], type: 'wayPoint' },
        { point: [55.906679,37.706000], type: 'wayPoint' },
        { point: [55.886758,37.661844], type: 'wayPoint' },
      ]
    },
    {
      name: 'you',
      points: [
        { point: [55.908830,37.711122], type: 'wayPoint' },
        { point: [55.912400,37.716707], type: 'wayPoint' },
        { point: [55.886758,37.661844], type: 'wayPoint' },
      ]
    },
    {
      name: 'per',
      points: [
        { point: [55.908830,37.711122], type: 'wayPoint' },
        { point: [55.900769,37.739418], type: 'wayPoint' },
        { point: [55.886758,37.661844], type: 'wayPoint' },
      ]
    },
    {
      name: 'vol',
      points: [
        { point: [55.887631,37.661952], type: 'wayPoint' },
        { point: [55.911327,37.671437], type: 'wayPoint' },
        { point: [55.908830,37.711122], type: 'wayPoint' },
      ]
    },
  ]
  
  function reflect(promiseObject){
    var promise = promiseObject.promise
    var routeName = promiseObject.name
    return promise.then(function (route) {
      return {
        name: routeName,
        result: route.getJamsTime()
      }
    });
  }

  var promises = routes.map((route) => ({
    name: route.name,
    promise: ymaps.route(route.points)
  }))

  Promise.all(promises.map(reflect)).then(function(results) {
      console.log(results)
      document.body.innerHTML += '<div id="results"></div>';
      results.map((result) => document.getElementById('results').innerHTML += `<div class="results" id="${result.name}">` + result.result + '</div>')
      
  });
}
