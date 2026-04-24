/**
 * Search Page - TMDB Edition
 * Supports searching movies, TV shows, or both
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Film, Tv, AlertCircle } from 'lucide-react';
import { useSearchQuery } from '../hooks/useQueries';
import { SkeletonShowCard } from '../components/SkeletonCard';
import ShowCard from '../components/ShowCard';
import SEOHead from '../components/SEOHead';
import { MediaType } from '../services/tmdb';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as MediaType | 'all';
  const [inputValue, setInputValue] = useState(q);
  const [mediaType, setMediaType] = useState<MediaType | 'all'>(typeParam);
  const debouncedQ = useDebounce(q, 300);

  const { data: results, isFetching: loading, isError: error } = useSearchQuery(debouncedQ, mediaType);

  useEffect(() => { setInputValue(q); }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim(), type: mediaType });
    }
  };

  const handleTypeChange = (t: MediaType | 'all') => {
    setMediaType(t);
    if (q) setSearchParams({ q, type: t });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-8">
      <SEOHead
        title={q ? `Search: "${q}" – StreamVault` : 'Search Movies & TV Shows – StreamVault'}
        description={q ? `Search results for "${q}". Find movies and TV shows on StreamVault.` : 'Search thousands of movies and TV shows on StreamVault.'}
      />

      <div className="space-y-4">
        <h1 className="text-2xl font-black dark:text-white">Search</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-500 transition-shadow"
              autoFocus
            />
          </div>
          <button type="submit"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors">
            Search
          </button>
        </form>

        {/* Type filter */}
        <div className="flex gap-2">
          {(['all', 'movie', 'tv'] as const).map(t => (
            <button key={t} onClick={() => handleTypeChange(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${mediaType === t ? (t === 'tv' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {t === 'movie' && <Film className="w-4 h-4" />}
              {t === 'tv' && <Tv className="w-4 h-4" />}
              {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {q ? (
        <div className="space-y-4">
          {!loading && !error && results && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {results.length > 0 ? `${results.length} results for "${q}"` : `No results found for "${q}"`}
            </p>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">Search failed. Please try again.</p>
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {loading
              ? Array.from({ length: 16 }).map((_, i) => <SkeletonShowCard key={i} />)
              : (results || []).map(item => (
                <ShowCard
                  key={`${item.type}-${item.id}`}
                  id={item.id}
                  title={item.title}
                  image={item.image}
                  type={item.type}
                  year={item.year}
                  linkPrefix={`/${item.type}`}
                />
              ))
            }
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-700" />
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Search for your favorite movies and TV shows
          </p>
        </div>
      )}
    </div>
  );
}
