import { useNotification } from "../context/NotificationContext";

const Notification = () => {
  return <div style={{ color: "red" }}>{useNotification()}</div>;
};

export default Notification;
