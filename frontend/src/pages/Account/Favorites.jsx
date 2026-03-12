import React, { useEffect, useState } from 'react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Call backend API for favorites
    fetch('/api/favorites', { method: 'GET' })
      .then(response => response.json())
      .then(data => setFavorites(data))
      .catch(error => console.error('Error fetching favorites:', error));
  }, []);

  return (
    <div>
      <h1>Danh sách yêu thích</h1>
      <ul>
        {favorites.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;