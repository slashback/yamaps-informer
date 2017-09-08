const routeDataMock = [
    {
        uid: '1',
        name: 'МКАД',
        waypoints: [
            [55.91946385714214,37.71413931710397],[55.891622999999996,37.70677499999999],[55.87369399999999,37.742697],[55.84346099999999,37.801407],[55.819486,37.83768599999999],[55.81003499999997,37.78924499999999],[55.79966999999997,37.73609599999999],[55.795604999999966,37.71252199999999],[55.79274595287293,37.70794607171351]
        ]
    },
    {
        uid: '2',
        name: 'Через центр',
        waypoints: [
            [55.91946385714214,37.71413931710397],[55.891622999999996,37.70677499999999]
        ]
    },
    {
        uid: '3',
        name: 'Щелковское ш.',
        waypoints: [
            [55.87369399999999,37.742697],[55.84346099999999,37.801407],[55.819486,37.83768599999999],[55.81003499999997,37.78924499999999],[55.79966999999997,37.73609599999999],[55.795604999999966,37.71252199999999]
        ]
    }
]

const chartDataMock = [
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

export const RECEIVE_ROUTES = "RECEIVE_ROUTES"
export const receiveRoutes = (routes) => {
    return {
        type: RECEIVE_ROUTES,
        payload: routes,
    }
}

export const RECEIVE_CHARTS = "RECEIVE_CHARTS"
export const receiveCharts = (charts) => {
    return {
        type: RECEIVE_CHARTS,
        payload: charts,
    }
}

export const apiGetRoutes = () => {
    return function (dispatch, getState) {
        dispatch(receiveRoutes(routeDataMock))
    }
}

export const apiGetCharts = () => {
    return function (dispatch, getState) {
        dispatch(receiveCharts(chartDataMock))
    }
}
