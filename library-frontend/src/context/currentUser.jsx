import { createContext, useReducer, useContext } from "react";

const currentUserReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      window.localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    case "LOGOUT":
      window.localStorage.clear();
      return "";
    default:
      return state;
  }
};

const UserContext = createContext();

export const UserProvider = (props) => {
  const [user, userDispatch] = useReducer(currentUserReducer, null);

  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {props.children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const values = useContext(UserContext);
  return values[0];
};

export const useUserDispatch = () => {
  const values = useContext(UserContext);
  return values[1];
};

export default UserContext;
