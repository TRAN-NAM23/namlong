import React, { useState } from 'react';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call backend API for password change
    fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error changing password:', error));
  };

  return (
    <div>
      <h1>Đổi mật khẩu</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">Đổi mật khẩu</button>
      </form>
    </div>
  );
};

export default ChangePassword;