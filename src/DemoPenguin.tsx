import React from 'react';
import './styles.css';

interface DemoPenguinProps {
    clientToken: string;
    userId: string;
    userInfo: any;
    children: React.ReactNode;
    className?: string;
}

export const DemoPenguin: React.FC<DemoPenguinProps> = ({
    clientToken,
    userId,
    userInfo,
    children,
    className = ''
}) => {
    //when this is initialized, make an API call to to localhost:3000/api/v1/get/application
    console.log("DemoPenguin initialized with:", { clientToken, userId, userInfo });
    fetch('http://localhost:3000/api/v1/get/application', {
      headers: {
        'demopenguin-client-token': clientToken
      }
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  
  
  
    return (
      <>
        <div className={`dp-overlay ${className}`}>
          <div className="dp-modal">
            <h1 className="dp-title">DemoPenguin</h1>
            <p className="dp-text">This is a test application wrapped in the DemoPenguin component.</p>
            <p className="dp-text">Check the console to see the initialization logs.</p>
          </div>
        </div>
        {children}
      </>)
  };