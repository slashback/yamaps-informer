import React from 'react'
import ItemAction from './item_action'

export const ChartListItem = (props) => {
    const chart = props.chart
    const chartEditUrl = {
        pathname: `/admin/chart/${chart.uid}`, 
        chart: chart,
    }
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
                        <ItemAction title="Edit" link={chartEditUrl} />
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
        </li>
    )
}

export default ChartListItem
