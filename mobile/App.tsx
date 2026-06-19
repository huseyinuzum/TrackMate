import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import { api } from './src/services/api';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

type ScreenName = 'LOGIN' | 'REGISTER' | 'HOME';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('LOGIN');
  const { theme, themeColors } = useTheme();

  const handleLogout = () => {
    api.logout();
    setCurrentScreen('LOGIN');
  };

  return (
    <>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={themeColors.bgPrimary} 
      />
      {currentScreen === 'LOGIN' && (
        <LoginScreen 
          onNavigateToRegister={() => setCurrentScreen('REGISTER')} 
          onLoginSuccess={() => setCurrentScreen('HOME')} 
        />
      )}
      {currentScreen === 'REGISTER' && (
        <RegisterScreen 
          onNavigateToLogin={() => setCurrentScreen('LOGIN')} 
          onRegisterSuccess={() => setCurrentScreen('HOME')} 
        />
      )}
      {currentScreen === 'HOME' && (
        <HomeScreen 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
