import React from 'react'


class ChartEdit extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.onChangeName = this.onChangeName.bind(this)
        this.onSave = this.onSave.bind(this)
        this.onChangeDescription = this.onChangeDescription.bind(this)
        this.state = {
            uid: "",
            name: "",
            description: "",
            routes: [3, 4],
            allRoutes: [],
        }
    }

    componentWillReceiveProps (nextProps) {
        console.log('PROPS EDIT', nextProps)
        const chart = nextProps.chart
        this.setState({
            uid: chart.uid,
            name: chart.name,
            description: chart.description,
            routes: chart.routes,
            allRoutes: nextProps.allRoutes,
        })
    }

    onSave() {
        const chart = {
            uid: this.state.uid,
            name: this.state.name,
            description: this.state.description,
            routes: this.state.routes
        }
        this.props.onSave(chart)
    }

    handleChange(event) {
        console.log(event.target.checked)
        console.log(event.target.value)
        const checked = event.target.checked
        const routeId = parseInt(event.target.value, 10)
        if (checked === true) {
            console.log('CHECKED')
            this.setState({
                routes: [
                    ...this.state.routes,
                    routeId,
                ]
            })
        } else {
            this.setState({
                routes: this.state.routes.filter(item => item !== routeId)
            })
        }
    }

    onChangeName(value) {
        this.setState({
            name: value
        })
    }

    onChangeDescription(value) {
        this.setState({
            description: value
        })
    }

    render() {
        console.log('ALL OUTE', this.state.allRoutes)
        return (
        <div
            style={{
                display: "flex",
                margin: "10px auto",
                flexDirection: "column",
                width: "300px",
            }}
        >
            <input
                placeholder="Название" 
                id="name" 
                type="text" 
                value={this.state.name}
                onChange={(e) => this.onChangeName(e.target.value)}
                style={{
                    margin: "5px 0",
                    height: "30px",
                }}
            />
            <input
                placeholder="Описание" 
                id="description" 
                type="text" 
                value={this.state.description}
                onChange={(e) => this.onChangeDescription(e.target.value)}
                style={{
                    margin: "5px 0",
                    height: "30px",
                }}
            />
            <ul>
                {this.state.allRoutes.map(route => {
                    const isChecked = this.state.routes.includes(route.uid)
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
                                    <input
                                        type="checkbox" 
                                        id={route.uid} 
                                        value={route.uid}
                                        checked={isChecked}
                                        onChange={this.handleChange}
                                    />
                                </span>
                            </div>
                        </li>
                    )
                })}
            </ul>
            <button
                onClick={this.onSave}
            >
                Сохранить
            </button>
        </div>
    )
    }
}

export default ChartEdit

