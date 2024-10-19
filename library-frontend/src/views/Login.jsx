import Notification from "../components/Notification";
import NavBar from "../components/NavBar";
import { useField } from "../hooks/useField";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";
import { useUserDispatch } from "../context/currentUser";
import { useNotificationDispatch } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { reset: resetUser, ...username } = useField("text");
  const { reset: resetPass, ...password } = useField("password");
  const dispatchU = useUserDispatch();
  const dispatchN = useNotificationDispatch();
  const navigate = useNavigate();

  const [login] = useMutation(LOGIN, {
    onCompleted: (data) => {
      dispatchU({
        type: "LOGIN",
        payload: {
          username: username.value,
          token: "Bearer " + data.login.value,
        },
      });
      dispatchN({ type: "SET", payload: "User logged in successfully" });
      setTimeout(() => {
        dispatchN({ type: "RESET" });
      }, 5000);

      navigate(-1);
    },
    onError: (error) => {
      const msg = error.graphQLErrors.map((e) => e.message).join("\n");
      dispatchN({ type: "SET", payload: msg });
      setTimeout(() => {
        dispatchN({ type: "RESET" });
      }, 5000);
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const uN = username.value.trim();
    login({
      variables: { username: uN, password: password.value },
    });
    resetUser();
    resetPass();
  };

  return (
    <>
      <NavBar />
      <Notification />
      <br></br>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input {...username} />
        </div>
        <div>
          <label>Password: </label>
          <input {...password} />
        </div>
        <button type="submit">Login</button>
      </form>
    </>
  );
};

export default Login;
