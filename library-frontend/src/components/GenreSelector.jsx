import { useQuery } from "@apollo/client";
import { ALL_GENRES } from "../queries";

const GenreSelector = ({ handleClick }) => {
  const result = useQuery(ALL_GENRES);
  if (result.loading) return <button disabled> loading...</button>;
  if (result.error) return null;
  return (
    <div>
      {result.data.allGenres.map((each) => (
        <button value={each} key={each} onClick={handleClick}>
          {each}
        </button>
      ))}
    </div>
  );
};

export default GenreSelector;
