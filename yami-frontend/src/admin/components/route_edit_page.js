import React from 'react'
import { connect } from 'react-redux'
import { apiSaveRoute, apiRemoveRoute } from '../actions'
import NeedAuth from '../../auth/components/need_auth'
import RemoveRoute from './route_remove'

const isArraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

class RouteEditPage extends React.Component {
    constructor(props) {
        super(props)
        this.initMap = this.initMap.bind(this)
        this.onChangeName = this.onChangeName.bind(this)
        this.onChangeDescription = this.onChangeDescription.bind(this)
        this.onSave = this.onSave.bind(this)
        this.onRemoveRoute = this.onRemoveRoute.bind(this)
        this.getRouteId = this.getRouteId.bind(this)
        this.state = {
            name: "",
            description: "",
            waypoints: ["Москва", [55.85291424814013, 37.68412805566206]],
            yamapsInstance: ymaps // eslint-disable-line
        }
    }

    componentWillMount() {
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
        this.state.yamapsInstance.ready(() => { this.initMap(this.state.waypoints) })
        
    }

    onChangeName(value) {
        this.setState({
            name: value
        })
    }

    onChangeDescription(value) {
        this.setState({
            description: value
        })
    }

    onRemoveRoute(routeId) {
        this.props.onRemoveRoute(routeId)
    }

    getRouteId() {
        return parseInt(this.props.match.params.routeId, 10)
    }

    onSave() {
        const data = {
            name: this.state.name,
            description: this.state.description,
            waypoints: this.state.waypoints,
            uid: this.props.match.params.routeId
        }
        // const routeId = this.props.match.params.routeId
        this.props.onSaveRoute(data)
    }

    initMap(initWaypoints) {
        var multiRoute = new this.state.yamapsInstance.multiRouter.MultiRoute({
            referencePoints: initWaypoints
        }, {
            editorMidPointsType: "via",
            editorDrawOver: false
        });
        var myMap = new this.state.yamapsInstance.Map('map', {
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
        
        var self = this
        multiRoute.events.add("update",function () {
            const coordinates = []
            var wayPoints = multiRoute.getWayPoints();
            var viaPoints = multiRoute.getViaPoints();
            coordinates.push(wayPoints.get(0).geometry.getCoordinates())
            viaPoints.each(function (point){
                coordinates.push(point.geometry.getCoordinates())
            })
            coordinates.push(wayPoints.get(1).geometry.getCoordinates())
            if (!isArraysEqual(coordinates, self.state.waypoints)) {
                self.setState({
                    waypoints: coordinates
                })
            }
        });
    }

    render() {
        return (
            <NeedAuth>
                <div>
                    <RemoveRoute 
                        routeId={this.getRouteId()} 
                        onRemoveRoute={this.onRemoveRoute} 
                    />
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
                            color: "white",
                            padding: "10px",
                            fontSize: "small",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <span className="card-title">Новый маршрут</span>
                        <p>Можно двигать точки начала и конца и добавлять промежуточные точки (нужно потянуть за линию маршрута)</p>
                        <input
                            placeholder="Название" 
                            id="name" 
                            type="text" 
                            value={this.state.name}
                            onChange={(e) => this.onChangeName(e.target.value)}
                            style={{
                                margin: "5px 0",
                                height: "30px",
                            }}
                        />
                        <input 
                            placeholder="Описание" 
                            id="description" 
                            type="text" 
                            value={this.state.description}
                            onChange={(e) => this.onChangeDescription(e.target.value)}
                            style={{
                                margin: "5px 0",
                                height: "30px",
                            }}
                        />
                        <a
                            onClick={this.onSave}
                            style={{
                                cursor: "pointer",
                                alignSelf: "center",
                                fontSize: "larger",
                                borderBottom: "1px solid",
                                margin: "7px 0"
                            }}
                        >
                            Сохранить
                        </a>
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
            </NeedAuth>
        )
    }
}

const mapStateToProps = (state) => {
  return {
    routes: state.routes,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveRoute: (route) => {
      dispatch(apiSaveRoute(route))
    },
    onRemoveRoute: (routeId) => {
        dispatch(apiRemoveRoute(routeId))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteEditPage)