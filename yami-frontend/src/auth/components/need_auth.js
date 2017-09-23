import React from 'react'
import { Redirect } from 'react-router'
import { readCookie } from '../actions'


class NeedAuth extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            token: ""
        }
    }

    componentWillMount() {
        const token = readCookie('token') || ""
        console.log(token)
        this.setState({
            token: token
        })
    }

    render() {
        if (this.state.token !== "") {
            return (
                <div>{this.props.children}</div>
            ) 
        } else {
            return (
                <Redirect to="/auth"/>
            )
        }
    }
}

export default NeedAuth