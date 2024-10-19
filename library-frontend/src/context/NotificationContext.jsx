import { createContext, useContext, useReducer } from "react";

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "RESET":
      return "";
    default:
      return state;
  }
};

const NotificationContext = createContext();

export const NotificationProvider = (props) => {
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    ""
  );

  return (
    <NotificationContext.Provider value={[notification, notificationDispatch]}>
      {props.children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const values = useContext(NotificationContext);
  return values[0];
};

export const useNotificationDispatch = () => {
  const values = useContext(NotificationContext);
  return values[1];
};

export default NotificationContext;
