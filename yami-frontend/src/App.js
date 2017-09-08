import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import './App.css';
import ChartPage from './components/chart_page'
import AdminPage from './admin/components/admin_page'
import RouteEditPage from './admin/components/route_edit_page'
import adminReducer from './admin/reducers'

const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const store = createStore(
  adminReducer,
  applyMiddleware(
    thunkMiddleware,
    logger
  )
)

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Switch>
              <Route path="/skip/" component={ChartPage} />
              <Route path="/admin/route/:routeId" component={RouteEditPage} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/" component={ChartPage} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
