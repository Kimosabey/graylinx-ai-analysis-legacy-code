const initialState = {
    locationData: {}
}


const dashboardReducer = ( state = initialState, action) => {
    switch(action.type) {
        case "location": 
            return {...state, locationData: action.payload};
        default: 
            return state;
    }
}

export default  dashboardReducer;