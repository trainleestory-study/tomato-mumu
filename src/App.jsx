import React from 'react';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FDFBF7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍅</div>
      <h1 style={{ color: '#5C4033', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        蕃茄MuMu仔上線成功！
      </h1>
      <p style={{ color: '#8C7A6B', fontSize: '16px', margin: 0 }}>
        太棒了！網頁已經順利運作囉！
      </p>
    </div>
  );
}
