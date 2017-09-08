import React from 'react'
import { Link } from 'react-router-dom'

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

export const AdminPage = () => {
    const apiGetCharts = [
        {
            uid: '1',
            name: 'Домой',
            description: 'Дорога метро-дом',
            routes: ["1", "2"],
        },
        {
            uid: '2',
            name: 'На работу',
            description: 'От дома до офиса',
            routes: ["2", "3"]
        }
    ]
    const apiGetRoutes = [
        {
            uid: '1',
            name: 'МКАД',
            waypoints: [
                [55.91946385714214,37.71413931710397],[55.891622999999996,37.70677499999999],[55.87369399999999,37.742697],[55.84346099999999,37.801407],[55.819486,37.83768599999999],[55.81003499999997,37.78924499999999],[55.79966999999997,37.73609599999999],[55.795604999999966,37.71252199999999],[55.79274595287293,37.70794607171351]
            ]
        },
        {
            uid: '2',
            name: 'Через центр',
            waypoints: [
                [55.91946385714214,37.71413931710397],[55.891622999999996,37.70677499999999]
            ]
        },
        {
            uid: '3',
            name: 'Щелковское ш.',
            waypoints: [
                [55.87369399999999,37.742697],[55.84346099999999,37.801407],[55.819486,37.83768599999999],[55.81003499999997,37.78924499999999],[55.79966999999997,37.73609599999999],[55.795604999999966,37.71252199999999]
            ]
        }
    ]
    const charts = prepareChartData(apiGetCharts, apiGetRoutes)
    const routes = apiGetRoutes
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

export default AdminPage
