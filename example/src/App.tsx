import React from 'react';
import { DemoPenguin } from 'demo-penguin';

function App() {
  return (
    <div>
      <DemoPenguin
        clientToken="eebfd94d4b59a125e4bf2f189f83f517627973cfd29d4d52c3be6db884b9263e"
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
    </div>
  );
}

export default App;