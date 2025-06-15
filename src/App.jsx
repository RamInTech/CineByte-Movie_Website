import React, { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';

import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [movieType, setMovieType] = useState('latest'); // 'latest' or 'upcoming'

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 700, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let endpoint = '';

      if (query) {
        // Search mode
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
          query
        )}&include_adult=false&language=en-US`;
      } else {
        // Display by selected type
        if (movieType === 'latest') {
          endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&with_original_language=ta&primary_release_date.gte=2024-01-01&release_date.lte=2025-06-13&vote_count.gte=10&region=IN`;
        } else if (movieType === 'upcoming') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const startDate = oneMonthAgo.toISOString().split('T')[0];

          endpoint = `${API_BASE_URL}/discover/movie?with_original_language=ta&sort_by=release_date.desc&primary_release_date.gte=${startDate}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies. Please try again later.');
        setMovieList([]);
        return;
      }

      let results = data.results || [];

      // For search: prioritize Tamil movies and sort by popularity
      if (query) {
        results.sort((a, b) => {
          const aTamil = a.original_language === 'ta' ? 1 : 0;
          const bTamil = b.original_language === 'ta' ? 1 : 0;

          if (aTamil !== bTamil) {
            return bTamil - aTamil; // Tamil movies first
          }

          return b.popularity - a.popularity; // More popular first
        });
      }

      setMovieList(results);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, movieType]);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="poster.png" alt="hero" className="mb-8 w-130" />
          <h1>
            Find Your <span className='text-gradient'>Perfect Movie</span> Match Instantly
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {!debouncedSearchTerm && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setMovieType('latest')}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                movieType === 'latest'
                  ? 'bg-indigo-700 text-white shadow-md transition-opacity-30'
                  : 'bg-gray-200 text-gray-900 hover:bg-indigo-500 hover:text-white transition-opacity-30'
              }`}
            >
              Latest Movies
            </button>
            <button
              onClick={() => setMovieType('upcoming')}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                movieType === 'upcoming'
                  ? 'bg-indigo-700 text-white shadow-md transition-opacity-30'
                  : 'bg-gray-200 text-gray-900 hover:bg-indigo-500 hover:text-white transition-opacity-30'
              }`}
            >
              Upcoming Movies
            </button>
          </div>
        )}

        <section className="all-movies mt-8">
          <h2 className="text-xl font-semibold mb-4">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
