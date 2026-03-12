import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 10.762622, lng: 106.660172 }; // Hồ Chí Minh

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Thay bằng key của bạn
  });

  useEffect(() => {
    fetch('/api/addresses', { method: 'GET' })
      .then(response => response.json())
      .then(data => setAddresses(data))
      .catch(error => console.error('Error fetching addresses:', error));
  }, []);

  const handleMapClick = (e) => {
    setSelectedPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    // Có thể gọi API reverse geocode để lấy địa chỉ từ lat/lng
  };

  return (
    <div>
      <h1>Địa chỉ giao hàng</h1>
      <ul>
        {addresses.map(address => (
          <li key={address.id}>{address.details}</li>
        ))}
      </ul>
      <h2>Chọn vị trí trên bản đồ</h2>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPosition}
          zoom={15}
          onClick={handleMapClick}
        >
          <Marker position={selectedPosition} />
        </GoogleMap>
      )}
      <div>
        <b>Vị trí đã chọn:</b> {selectedPosition.lat}, {selectedPosition.lng}
      </div>
    </div>
  );
};

export default Addresses;