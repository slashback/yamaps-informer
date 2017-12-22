import React from 'react'
import { Link } from 'react-router-dom'
import ChartListItem from './chart_list_item'

const ChartList = (props) => {
    const charts = props.charts
    const chartListStyle = {
        flexGrow: 4,
        margin: "0 20px",
    }
    return (
        <div 
            className="chartListWrapper"
            style={chartListStyle}
        >
            <div className="header">
                <h1>Графики</h1>
            </div>
            <div className="charts-content">
                <ul className="chart_list">
                    {charts.map(chart => {
                        return (
                            <ChartListItem 
                                chart={chart} 
                                key={chart.uid}
                            />
                        )
                    })}
                </ul>
                <div>
                    <Link 
                        style={{
                            textDecoration: "none",
                            color: "#0064a8",
                            borderBottom: "1px solid #0064a8",
                        }}
                        to="admin/chart/">
                        Новый график
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ChartList