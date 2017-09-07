import React from 'react'

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
        },
        {
            uid: '2',
            name: 'Через центр',
        },
        {
            uid: '3',
            name: 'Щелковское ш.',
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
                            return (
                                <li
                                    style={{
                                        margin: "5px 0"
                                    }}
                                >
                                    {route.name}
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
