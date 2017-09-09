import React from 'react'
import { Link } from 'react-router-dom'

export const ItemAction = (props) => {
    const {
        title,
        link,
    } = props
    return (
        <Link 
            style={{
                textDecoration: "none",
                margin: "0 5px",
                color: "#0064a8",
                borderBottom: "1px solid #0064a8",
            }}
            to={link}>
            {title}
        </Link>
    )
}

export default ItemAction

