import { combineReducers } from "redux";
import user from './user_reducer';
// import comment from './comment_reducer';
// import subscribe from './subscribe_reducer';

const rootReducer = combineReducers({
    user
    // comment,
    // subscribe
})

export default rootReducer