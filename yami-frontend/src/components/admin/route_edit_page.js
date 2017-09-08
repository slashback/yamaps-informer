import React from 'react'

class RouteEditPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: "",
            description: "",
            waypoints: [],
        }
    }

    componentWillMount() {
        console.log('PROPS', this.props)
        const route = this.props.location.route
        if (route === undefined) {
            // api call
        } else {
            this.setState({
                name: route.name,
                description: route.description,
                waypoints: route.waypoints,
            })
        }
    }

    render() {
        return (<h1>Hello</h1>);
    }
}


// eslint-disable-next-line
const yam = ymaps

var coordinates = []
const init = (initWaypoints) => {
    console.log('INIT', initWaypoints)
    var multiRoute = new yam.multiRouter.MultiRoute({
        referencePoints: initWaypoints
    }, {
        editorMidPointsType: "via",
        editorDrawOver: false
    });
    var myMap = new yam.Map('map', {
        center: [
        55.832824252908594,
        37.6491091347636
        ],
        zoom: 11,
        controls: []
    }, {
        buttonMaxWidth: 300
    });
    
    multiRoute.editor.start()
    myMap.geoObjects.add(multiRoute);

    multiRoute.events.add("update",function () {
      coordinates = []
      var wayPoints = multiRoute.getWayPoints();
      var viaPoints = multiRoute.getViaPoints();
      coordinates.push(wayPoints.get(0).geometry.getCoordinates())
      viaPoints.each(function (point){
        console.log('__', point.geometry.getCoordinates())
        coordinates.push(point.geometry.getCoordinates())
      })
      coordinates.push(wayPoints.get(1).geometry.getCoordinates())
      console.log(coordinates)
    });
}

const change = () => {

    var routeName = document.getElementById('name').value;
    var routeDescription = document.getElementById('description').value;
    if( routeName.length === 0 ){
        alert('Нужно ввести хотя бы название маршрута');
    return;
    }

    console.log(coordinates)
    const routeData = JSON.stringify({
        name: routeName,
        description: routeDescription,
        waypoints: coordinates
    })
    console.log(routeData)
    // $.ajax({
    //     url: "/route",
    //     type: "POST",//type of posting the data
    //     data: {
    //         routeData
    //     },
    //     success: function (data) {
    //         console.log('OK')
    //         //what to do in success
    //     },
    //     error: function(xhr, ajaxOptions, thrownError){
    //         console.log('NOT')
    //     },
    //     timeout : 15000//timeout of the ajax call
    // });
}



const RouteEditPage1 = (params) => {
    console.log(params)
    const route = params.location.route
    console.log(route)
    let waypoints = route.waypoints
    if (waypoints === undefined) {
        const defaultWaypoints = ["Москва", [55.85291424814013, 37.68412805566206]]
        waypoints = defaultWaypoints
    }
    yam.ready(() => { init(waypoints) })
    return (
        <div>
            <div
                id="control-form"
                style={{
                    position: "fixed",
                    right: "40px",
                    top: "40px",
                    width: "300px",
                    height: "200px",
                    zIndex: "1",
                    backgroundColor: "#546e7a",
                }}
            >
                <div className="card blue-grey darken-1">
                        <div className="card-content white-text">
                        <span className="card-title">Новый маршрут</span>
                        <p>Можно двигать точки начала и конца и добавлять промежуточные точки (нужно потянуть за линию маршрута)</p>
                        <input placeholder="Название" id="name" type="text"/>
                        <input placeholder="Описание" id="description" type="text"/>
                        <a className="waves-effect waves-light btn" onClick={change}>Сохранить</a>
                        </div>
                </div>
            </div>
                <div
                    id="page"
                    style={{
                        position: "absolute",
                        right: "0px",
                        top: "0px",
                        left: "0px",
                        bottom: "0px",
                    }}
                >
                <div 
                    id="map"
                    style={{
                        width:"100%", 
                        height:"100%"
                    }}></div>

                </div>
        </div>
    )
}

export default RouteEditPage