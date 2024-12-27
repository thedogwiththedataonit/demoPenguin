import React from 'react';

interface DemoPenguinProps {
  apikey: string;
  userId: string;
  userInfo: any;
  children: React.ReactNode;
}

export const DemoPenguin: React.FC<DemoPenguinProps> = ({
  apikey,
  userId,
  userInfo,
  children
}) => {
  React.useEffect(() => {
    // Initialize with provided props
    console.log('DemoPenguin initialized with:', { apikey, userId, userInfo });
  }, [apikey, userId, userInfo]);

  return <>{children}</>;
};