import loggedReducer from './isLogged';
import  dashboardReducer from './inDashboard'
import alarmReducer from './alarm';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    isLogged: loggedReducer,
    inDashboard:dashboardReducer,
    alarm:alarmReducer
})

export default rootReducer;