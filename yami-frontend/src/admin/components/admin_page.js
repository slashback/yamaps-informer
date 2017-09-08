import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { apiGetRoutes, apiGetCharts } from '../actions'

const prepareChartData = (charts, routes) => {
    return charts.map(chart => {
        return {
            ...chart,
            routes: chart.routes.map(routeId => {
                return routes.find(route => route.uid === routeId)
            })
        }
    })
}

class AdminPage extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.props.initCharts()
        this.props.initRoutes()
    }

    render() {
        const charts = prepareChartData(this.props.charts, this.props.routes)
        const routes = this.props.routes
    return (
        <div
            style={{
                display: "flex",
                margin: "10px",
            }}
        >
            <div 
                className="chartListWrapper"
                style={{
                    flexGrow: 4,
                    margin: "0 20px",
                }}
            >
                <div className="header">
                    <h1>Графики</h1>
                </div>
                <div className="charts-content">
                    <ul className="chart_list">
                        {charts.map(chart => {
                            return (
                                <li
                                    className="chart_list_item"
                                    style={{
                                        margin: "20px 0"
                                    }}
                                    key={chart.uid}
                                >
                                    <div
                                        className="chart_item"
                                        style={{
                                            margin: "10px 0"
                                        }}
                                    >
                                        <div 
                                            className="chart_item_title_wrapper"
                                            style={{
                                                display: "flex"
                                            }}
                                        >
                                            <span
                                                className="chart_item_title"
                                                style={{
                                                    flexGrow: "1"
                                                }}    
                                            >{chart.name}</span>
                                            <div
                                                className="chart-item-actions"
                                            >
                                                <span 
                                                    className="chart_item_action"
                                                    style={{
                                                        margin: "0 5px",
                                                    }}
                                                >Edit</span>
                                                <span 
                                                    className="chart_item_action"
                                                    style={{
                                                        margin: "0 5px",
                                                    }}
                                                >Del</span>
                                            </div>
                                        </div>
                                        <span
                                            className="chart-item-descr"
                                            style={{
                                                color: "rgba(128, 128, 128, 0.75)",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            {chart.description}
                                        </span>
                                    </div>
                                    <div className="chart-routes-list-wrapper">
                                        <ul className="chart-routes-list">
                                            {chart.routes.map(route => {
                                                return (
                                                    <li
                                                        className="chart-routes-list-item"
                                                        style={{
                                                            margin: "3px 0"
                                                        }}
                                                        key={route.uid}
                                                    >
                                                        {route.name}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </li>
                            )
                        })}
                        
                        
                    </ul>
                </div>
            </div>
            <div 
                className="routeListWrapper"
                style={{
                    flexGrow: 1,
                    borderLeft: "1px solid rgba(128, 128, 128, 0.32)",
                    padding: "10px 20px",
                }}
            >
                <div className="header">
                    <h1>Маршруты</h1>
                </div>
                <div className="routes-content">
                    <ul>
                        {routes.map(route => {
                            const routeEditUrl = {
                                pathname: `/admin/route/${route.uid}`, 
                                route: route,
                            }
                            return (
                                <li
                                    className="route-item-wrapper"
                                    style={{
                                        margin: "5px 0",
                                        display: "flex",
                                    }}
                                    key={route.uid}
                                >
                                    <div
                                        style={{
                                            flexGrow: 1,
                                        }}
                                    >
                                        {route.name}
                                    </div>
                                    <div
                                        className="route-item-actions"
                                    >
                                        <span 
                                            className="chart_item_action"
                                            style={{
                                                margin: "0 5px",
                                            }}
                                        >
                                            <Link 
                                                style={{
                                                    textDecoration: "none",
                                                    color: "#0064a8",
                                                    borderBottom: "1px solid #0064a8",
                                                }}
                                                to={routeEditUrl}>
                                                Edit
                                            </Link>
                                        </span>
                                    </div>
                                    
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    ) 
    }

}

const mapStateToProps = (state) => {
  return {
    routes: state.routes,
    charts: state.charts,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initRoutes: () => {
      dispatch(apiGetRoutes())
    },
    initCharts: () => {
      dispatch(apiGetCharts())
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminPage)
