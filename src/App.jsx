import React, { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';

import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {getTrendingMovies, updateSearchCount } from './appwrite';

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
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [movieType, setMovieType] = useState('latest'); // 'latest' or 'upcoming'

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 700, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let endpoint = '';

      if (query) {
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
          query
        )}&include_adult=false&language=en-US`;
      } else {
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

      if (query) {
        results.sort((a, b) => {
          const aTamil = a.original_language === 'ta' ? 1 : 0;
          const bTamil = b.original_language === 'ta' ? 1 : 0;

          if (aTamil !== bTamil) {
            return bTamil - aTamil;
          }

          return b.popularity - a.popularity; 
        });
      }

      setMovieList(data.results || []);

      
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    }
    catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, movieType]);

  useEffect(() => {
    loadTrendingMovies();
  },[]); 

  return (
    <main>
      <div className="pattern" />
      
      <div className="wrapper">
        <h1>CineFlix</h1>
        <div className='flex flex-row justify-between m-0 '> <span className='text-gradient text-xs hidden md:block '>Cinema Explorer📽️</span>
           <span className='text-gradient text-xs hidden md:block '>Ramkumar🎬</span>
        </div>
        <header>
          <img src="poster.png" alt="hero" className="mb-8 mt-1 w-full" />
          <h1>
            Find Your <span className='text-gradient'>Perfect Movie</span> Match Instantly
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie ,index) => (
                <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.title} />
                </li>
               ))}
            </ul>
          </section>
        )}

        {!debouncedSearchTerm && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMovieType('latest')}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                movieType === 'latest'
                  ? 'bg-indigo-700 text-white shadow-md transition-opacity-30'
                  : 'bg-gray-200 text-gray-900 hover:bg-indigo-500 hover:text-white  transition-opacity-30'
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

        <section className="all-movies">
          <h2 className='text-[28px]'>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className='cursor-grab'>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

        <footer className="text-center my-15 pt-8 border-t border-gray-400">
          <h1 className="text-white text-3xl font-bold">Contact</h1>
          <p className="text-white  text-lg">
            Email: ramkumarm0621@gmail.com
          </p>
          <p className="text-white text-sm mt-4"> <span className='text-gradient'>&copy; Ramkumar 2025 CineFlix. All rights reserved. </span></p>
        </footer>
      </div>
    </main>
  );
};

export default App;
