import React from 'react'
import { Link } from 'react-router-dom'

export const RemoveRoute = (props) => {
    const {
        routeId,
        onRemoveRoute
    } = props
    return (
        <a 
            onClick={() => onRemoveRoute(routeId)}
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

export default RemoveRoute