import { useQuery } from "@apollo/client";
import NavBar from "../components/NavBar";
import { ALL_BOOKS } from "../queries";
import Notification from "../components/Notification";
import GenreSelector from "../components/GenreSelector";
import { useState } from "react";
import { useNotificationDispatch } from "../context/NotificationContext";
import { BOOK_ADDED } from "../queries";
import { useSubscription } from "@apollo/client";

const Books = () => {
  const [filter, setFilter] = useState(null);
  const dispatch = useNotificationDispatch();

  const result = useQuery(ALL_BOOKS, {
    variables: { genre: filter, author: null },
    onCompleted: (data) => {
      console.log(data);
    },
    onError: (error) => {
      const msg = error;
      dispatch({ type: "SET", payload: msg });
      setTimeout(() => {
        dispatch({ type: "RESET" });
      }, 5000);
    },
  });

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const bookAdded = data.data.bookAdded;
      updateBookCache(
        client.cache,
        { query: ALL_BOOKS, variables: { genre: null, author: null } },
        bookAdded
      );
    },
    onError: (error) => {
      console.error("Subscription Error:", error);
    },
  });

  const handleFilter = (event) => {
    event.preventDefault();
    setFilter(event.target.value);
  };

  if (result.loading) return <div>Loading...</div>;
  if (result.error) return <div> Error Occured</div>;

  const books = result.data.allBooks;

  return (
    <div>
      <NavBar />
      <Notification />
      <h2>books</h2>
      {filter ? (
        <div>
          in genre <b>{filter}</b>
        </div>
      ) : (
        <div></div>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <GenreSelector handleClick={handleFilter} />
    </div>
  );
};

export default Books;

export const updateBookCache = (cache, query, addedBook) => {
  const uniqByTitle = (books) => {
    let seen = new Set();
    return books.filter((book) => {
      let title = book.title;
      return seen.has(title) ? false : seen.add(title);
    });
  };

  cache.updateQuery(query, (data) => {
    if (!data || !data.allBooks) {
      console.log("No existing data found in cache.");
      return data;
    }
    console.log("Existing books in cache:", data.allBooks);
    console.log("Added book:", addedBook);

    return {
      allBooks: uniqByTitle(data.allBooks.concat(addedBook)),
    };
  });
};
