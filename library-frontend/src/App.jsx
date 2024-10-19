import Authors from "./views/Authors";
import Books from "./views/Books";
import NewBook from "./views/NewBook";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Error from "./components/Error";
import Login from "./views/Login";
import { useEffect } from "react";
import { useUserDispatch } from "./context/currentUser";

const App = () => {
  const dispatch = useUserDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const user = window.localStorage.getItem("user");
    if (user) {
      dispatch({ type: "LOGIN", payload: JSON.parse(user) });
      navigate(-1);
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <Routes>
      <Route index element={<Navigate to="authors" replace={true} />}></Route>
      <Route path="authors" element={<Authors />}></Route>
      <Route path="books" element={<Books />}></Route>
      <Route path="add" element={<NewBook />}></Route>
      <Route path="login" element={<Login />}></Route>
      <Route path="*" element={<Error />}></Route>
    </Routes>
  );
};

export default App;
