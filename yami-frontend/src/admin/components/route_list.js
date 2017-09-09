import React from 'react'
import { Link } from 'react-router-dom'

const RouteList = (props) => {
    const routes = props.routes
    return (
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
    )
}

export default RouteList