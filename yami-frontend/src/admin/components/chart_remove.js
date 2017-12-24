import React from 'react'
import { Link } from 'react-router-dom'

export const RemoveChart = (props) => {
    const {
        chartId,
        onRemoveChart
    } = props
    return (
        <a 
            onClick={() => onRemoveChart(chartId)}
            style={{
                position: "fixed",
                left: "40px",
                top: "40px",
                zIndex: "1",
                backgroundColor: "#546e7a",
                color: "white",
                padding: "10px",
                fontSize: "small",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer"
            }}
        >
            Удалить
        </a>
    )
}

export default RemoveChart