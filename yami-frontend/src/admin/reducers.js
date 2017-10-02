import { 
  RECEIVE_ROUTES, 
  RECEIVE_CHARTS, 
  RECEIVE_ROUTE,
  EDIT_CHART_NAME,
  EDIT_CHART_DESCRIPTION,
  EDIT_CHART_ROUTES, 
} from './actions'
import { combineReducers } from 'redux'

function routes(state = [], action) {
  switch (action.type) {
    case RECEIVE_ROUTES:
      return [
        ...action.payload,
      ]
    case RECEIVE_ROUTE:
      console.log(state)
      console.log(state.filter(route => {
          return route.uid !== action.payload.uid
        }))
      return [
        ...state.filter(route => {
          return route.uid !== action.payload.uid
        }),
        action.payload,
      ]
    default:
      return state
  }
}

function charts(state = [], action) {
  switch (action.type) {
    case RECEIVE_CHARTS:
      return [
        ...action.payload,
      ]
    case EDIT_CHART_NAME:
      console.log(state)
      console.log(state.filter(item => item.uid !== action.chartId))
      console.log(state.find(item => item.uid === action.chartId)[0])
      return state
    default:
      return state
  }
}

export default combineReducers({
  routes,
  charts,
})