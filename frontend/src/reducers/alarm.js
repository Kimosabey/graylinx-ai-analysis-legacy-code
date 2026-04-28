import { isEqual } from 'lodash';
const initialState = {
    alarmData: {}
};

const alarmReducer = (state = initialState, action) => {
    switch (action.type) {
        case "alarm":
            // console.log("alarm:currtent state",state.alarmData)
            // console.log("alarm:to update state",action.payload)
            if (!isEqual(state.alarmData, action.payload)) {
                // console.log(new Date(),"State updated:", action.payload,"=======",state.alarmData);
                return { ...state, alarmData: action.payload };
            }
           // console.log("No state change detected.");
            // return state;

        default:
            return state;
    }
};

export default alarmReducer;
