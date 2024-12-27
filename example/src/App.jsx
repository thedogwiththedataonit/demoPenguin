import React from 'react';
import { DemoPenguin } from 'demo-penguin';

function App() {
  return (
    <DemoPenguin 
      apikey="test-api-key-123"
      userId="test-user-456"
      userInfo={{
        name: "Test User",
        email: "test@example.com"
      }}
    >
      <div style={{ padding: 20 }}>
        <h1>DemoPenguin Test App</h1>
        <p>This is a test application wrapped in the DemoPenguin component.</p>
        <p>Check the console to see the initialization logs.</p>
      </div>
    </DemoPenguin>
  );
}

export default App;