// frontend/src/pages/Home.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

// ----- Genre Color Helper -----
// Function to get a pastel color based on the genre string
const getGenreColor = (genre) => {
    if (!genre) return '#e0e0e0'; // Default grey for unknown genre
    // Simple hash function to get a somewhat consistent color
    let hash = 0;
    for (let i = 0; i < genre.length; i++) {
        hash = genre.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    // Generate pastel color components (light colors)
    const hue = Math.abs(hash % 360);
    const saturation = 70 + Math.abs(hash % 10); // Adjust saturation for pastel effect
    const lightness = 85 + Math.abs(hash % 10); // Adjust lightness for pastel effect
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


// ----- Helper Component: SongCard -----
const SongCard = ({ song, onToggleFavorite, isRecommendation = false }) => {
    // Determine border color based on genre
    const borderColor = getGenreColor(song.genre);
    const cardStyle = { 
        border: `2px solid ${borderColor}`, // Use dynamic border color
        borderRadius: '8px', 
        padding: '15px', 
        width: '280px', 
        margin: '10px',
        backgroundColor: '#fff', // White background for the card itself
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease-in-out' // Add subtle hover effect
    };
    
    // Slightly different style for recommendations
     if (isRecommendation) {
        cardStyle.borderStyle = 'dashed'; // Dashed border for recommendations
        cardStyle.backgroundColor = '#f9f9ff'; // Very light blue background
    }

    return (
        <div style={cardStyle} className="song-card"> {/* Added class for potential CSS hover */}
            <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1em' }}>{song.title}</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#555' }}>by {song.artist}</p>
                <p style={{ margin: 0, fontSize: '0.85em', color: '#777', fontWeight: 'bold' }}> {/* Bold Genre */}
                    Genre: {song.genre || 'N/A'} 
                </p>
            </div>
            {/* Favorite Button */}
            {onToggleFavorite && ( // Only show button if handler is provided
                 <button 
                    onClick={() => onToggleFavorite(song.id)}
                    style={{ 
                        cursor: 'pointer', 
                        fontSize: '24px', 
                        background: 'none', 
                        border: 'none', 
                        alignSelf: 'flex-end',
                        padding: '5px 0 0 0', 
                        color: song.is_favorite ? 'red' : '#ccc' 
                    }}
                    title={song.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                    {song.is_favorite ? '❤️' : '🤍'}
                </button>
            )}
            {/* If it's a recommendation and not favorited, show "Add" button */}
            {isRecommendation && !song.is_favorite && onToggleFavorite && (
                <button onClick={() => onToggleFavorite(song.id)} style={{ padding: '8px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#800020', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Add to Favorites
                </button>
             )}
        </div>
    );
};


// ----- Main Home Component -----
function Home({ apiBaseUrl = API_BASE_URL }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoadingSongs, setIsLoadingSongs] = useState(false);
    const [isLoadingRecs, setIsLoadingRecs] = useState(true);
    const [error, setError] = useState('');
    const [userFavorites, setUserFavorites] = useState(new Set()); // Store favorite IDs for quick checking

    const navigate = useNavigate();
    const token = localStorage.getItem('userToken');
    const debounceTimeoutRef = useRef(null);

    // Fetch User Favorites (Needed to mark songs correctly)
    const fetchUserFavorites = useCallback(async () => {
         if (!token) return;
         try {
             const headers = { 'Authorization': `Bearer ${token}` };
             const response = await axios.get(`${apiBaseUrl}/profile`, { headers }); // Use profile endpoint which includes favorites
             const favIds = new Set(response.data.favorite_songs.map(song => song.id));
             setUserFavorites(favIds);
             return favIds;
         } catch (err) {
             console.error("Error fetching user favorites:", err.response || err);
              if (err.response && err.response.status === 401) {
                localStorage.removeItem('userToken'); navigate('/login');
            }
            return new Set();
         }
    }, [apiBaseUrl, navigate, token]);

    // Fetch Recommendations
    const fetchRecommendations = useCallback(async (currentFavIds) => {
        if (!token) return;
        setIsLoadingRecs(true);
        setError('');
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await axios.get(`${apiBaseUrl}/recommendations`, { headers });
            // Mark recommendations based on current favorites
            const recsWithFavStatus = (response.data || []).map(song => ({
                ...song,
                is_favorite: currentFavIds.has(song.id) // Check against the set
            }));
            setRecommendations(recsWithFavStatus);
        } catch (err) {
            console.error("Error fetching recommendations:", err.response || err);
            setError('Could not fetch recommendations.');
        } finally {
            setIsLoadingRecs(false);
        }
    }, [apiBaseUrl, token]); // Removed navigate as it doesn't change

    // Search for Songs
    const searchForSongs = useCallback(async (query, currentFavIds) => {
        if (!token || query.length < 3) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSongs(true);
        setError('');
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await axios.get(`${apiBaseUrl}/search`, { headers, params: { q: query } });
             // Mark search results based on current favorites
            const resultsWithFavStatus = (response.data || []).map(song => ({
                 ...song,
                 is_favorite: currentFavIds.has(song.id) // Check against the set
            }));
            setSearchResults(resultsWithFavStatus);
        } catch (err) {
            console.error("Error searching songs:", err.response || err);
            setError('Could not perform search.');
        } finally {
            setIsLoadingSongs(false);
        }
    }, [apiBaseUrl, token]); // Removed navigate

    // --- Initial Data Load ---
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
             // Fetch favorites first, then recommendations
            fetchUserFavorites().then(favIds => {
                 fetchRecommendations(favIds); // Pass favorite IDs to mark recs correctly
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate]); // Run only when token changes


    // --- Event Handlers ---
    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchTerm(query);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            if (query.length >= 3) {
                // Pass current favorites to search to mark results correctly
                searchForSongs(query, userFavorites); 
            } else {
                setSearchResults([]);
            }
        }, 500);
    };

    const handleToggleFavorite = async (songId) => {
        if (!token) return navigate('/login');
        setError('');
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await axios.post(`${apiBaseUrl}/favorites`, { song_id: songId }, { headers });
            const action = response.data.action;
            const isNowFavorite = action === 'added';

            // Update the set of favorite IDs
            const newFavIds = new Set(userFavorites);
            if (isNowFavorite) {
                newFavIds.add(songId);
            } else {
                newFavIds.delete(songId);
            }
            setUserFavorites(newFavIds);

            // Update local states using the new favorite status
            const updateIsFavorite = (prevState) =>
                prevState.map(song =>
                    song.id === songId ? { ...song, is_favorite: isNowFavorite } : song
                );
                
            setSearchResults(updateIsFavorite);
            setRecommendations(updateIsFavorite);
            
            // Refetch recommendations based on the updated favorites in the backend
            fetchRecommendations(newFavIds);

        } catch (err) {
            console.error("Error toggling favorite:", err.response || err);
            setError('Could not update favorite status.');
        }
    };
    
    // --- Render Logic ---
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            
            {/* --- Recommendations Section --- */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#800020', /* Burgundy */ borderBottom: '2px solid #800020', paddingBottom: '10px' }}>
                    ✨ Recommendations For You ({recommendations.length})
                </h2>
                {isLoadingRecs && <p>Loading recommendations...</p>} 
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {!isLoadingRecs && recommendations.length > 0 ? (
                        recommendations.map(song => (
                            <SongCard 
                                key={`rec-${song.id}`} 
                                song={song} 
                                onToggleFavorite={handleToggleFavorite} 
                                isRecommendation={true} // Mark as recommendation for styling
                            />
                        ))
                    ) : (
                        !isLoadingRecs && <p>Add some songs to your favorites to get recommendations!</p>
                    )}
                </div>
            </div>

            <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

            {/* --- Search Section --- */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#333' }}>Search Songs</h2>
                <input
                    type="text"
                    placeholder="Search by title, artist, or genre (min 3 chars)..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: '95%', padding: '12px', fontSize: '1em', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                 {isLoadingSongs && <p>Loading search results...</p>}

                {/* Search Results */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {searchResults.length > 0 ? (
                        searchResults.map(song => (
                            <SongCard 
                                key={`search-${song.id}`} 
                                song={song} 
                                onToggleFavorite={handleToggleFavorite} 
                            />
                        ))
                    ) : (
                        searchTerm.length >= 3 && !isLoadingSongs && <p>No results found for "{searchTerm}".</p> 
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;

