const initialState = {
    data: {}
}


const loggedReducer = (state = initialState, action) => {
    switch (action.type) {
        case "login":
            return { ...state, data: action.payload };
        case "logout":
            return initialState;
        // case 'RESET_APP':
        //     console.log("dispatch RESET_APP")
        //         return initialState; 
        default:
            return state;
    }
}

export default loggedReducer;