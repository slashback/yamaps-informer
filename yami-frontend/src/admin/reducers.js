import { RECEIVE_ROUTES, RECEIVE_CHARTS, RECEIVE_ROUTE } from './actions'
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
    default:
      return state
  }
}

export default combineReducers({
  routes,
  charts,
})