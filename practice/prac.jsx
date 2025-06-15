import{ useState ,useEffect} from 'react';


const Card = ({movie}) => {

  const [count, setCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    console.log(`Movie: ${movie.title} has been liked ${isLiked} `);
  }, [isLiked]);
  
  return (
    <div className="card"> 
      <h2>{movie.title}</h2>
      <h1>{movie.year}</h1>
      {/* <p>Likes: {count}</p>
      <button onClick={()=> setCount(prev => prev+1)}> 👍🏻</button>
      <h3>|</h3>
      <button onClick={()=> setCount(prev => prev-1)}> 👎🏻</button> */}
      <button onClick={() => setIsLiked(!isLiked)} >
        {isLiked ? '❤️': '🤍'}    
      </button>

    </div>
  );
}

const App = () => {

  const movieList = [
    { title: "Inception" , year: 2010 },
    { title: "The Matrix", year: 1999 },
    { title: "Interstellar", year: 2014 }
  ];

  return (
    <div className="card-container">
      <Card movie={movieList[0]} />
      <Card movie={movieList[1]}/>
      <Card movie={movieList[2]} />
    </div>
  );
}

export default App;