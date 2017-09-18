import React from 'react'
import { connect } from 'react-redux'
// import ChartList from './chart_list'
// import RouteList from './route_list'
import { apiAuth } from '../actions'


class LoginPage extends React.Component {
    constructor(props) {
        super(props)
        this.onChangePass = this.onChangePass.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.state = {
            pass: "",
        }
    }

    componentWillMount() {
        // this.props.initCharts()
        // this.props.initRoutes()
    }

    onChangePass(value) {
        this.setState({
            pass: value
        })
    }

    onSubmit() {
        console.log('submit')
        this.props.apiAuth(this.state.pass)
    }

    render() {
        return (
            <div
                style={{
                    display: "flex",
                    margin: "10px",
                }}
            >
                <input
                    placeholder="Pass" 
                    id="pass" 
                    type="text" 
                    value={this.state.pass}
                    onChange={(e) => this.onChangePass(e.target.value)}
                    style={{
                        margin: "5px 0",
                        height: "30px",
                    }}
                />
                <input 
                    type="submit" 
                    value="Auth" 
                    style={{
                        width: "100px",
                        height: "35px",
                        margin: "5px 5px",
                    }}
                    onClick={this.onSubmit}
                />
            </div>
        ) 
    }

}

const mapStateToProps = (state) => {
  return {
    // routes: state.routes,
    // charts: state.charts,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    apiAuth: (pass) => {
      dispatch(apiAuth(pass))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage)