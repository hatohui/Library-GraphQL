import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import NavBar from "../components/NavBar";
import { useMutation, useQuery } from "@apollo/client";
import Notification from "../components/Notification";
import { useField } from "../hooks/useField";
import { useNotificationDispatch } from "../context/NotificationContext";
import { useUser } from "../context/currentUser";

const Authors = () => {
  const result = useQuery(ALL_AUTHORS);
  const { reset: resetName, type: type, ...name } = useField("text");
  const { reset: resetBorn, ...born } = useField("number");
  const dispatch = useNotificationDispatch();
  const currentUser = useUser();

  const handleAuthorUpdate = (event) => {
    event.preventDefault();
    editBorn({
      variables: { name: name.value.trim(), setBornTo: parseInt(born.value) },
    });
    resetBorn();
    resetName();
  };

  const [editBorn] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      const msg = error.graphQLErrors.map((e) => e.message).join("\n");
      dispatch({ type: "SET", payload: msg });
      setTimeout(() => {
        dispatch({ type: "RESET" });
      }, 5000);
    },
  });

  if (result.loading) return <div>Loading...</div>;
  if (result.error) return <div> Error Occured</div>;

  const authors = result.data.allAuthors;
  const listOfNames = authors.map((a) => a.name);

  return (
    <div>
      <NavBar />
      <Notification />
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born ? a.born : "null"}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {currentUser && (
        <div>
          <h2>Set birthyear</h2>
          <form onSubmit={handleAuthorUpdate}>
            <div>
              <label>name </label>
              <select {...name}>
                <option value="null" key="null"></option>
                {listOfNames.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>born </label>
              <input {...born} />
            </div>
            <button type="submit">update author</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Authors;
