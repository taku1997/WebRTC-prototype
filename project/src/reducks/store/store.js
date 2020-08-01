import {
  createStore as reduxCreateStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import { connectRouter, routerMiddleware } from "connected-react-router";
import thunk from 'redux-thunk';

// import { ProductsReducer } from '../products/reducers';
import { UsersReducer } from '../users/reducers';
import { TraineesReducer } from '../trainee/reducers';

export default function cretaeStore(history) {
  return reduxCreateStore(
    combineReducers({
      router: connectRouter(history),
      people: TraineesReducer,
      users: UsersReducer
    }),
    applyMiddleware(
      routerMiddleware(history),
      thunk
    )
  );
};
