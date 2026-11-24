import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from '@/navigation/AppNavigator';
import { UserNavigator } from '@/navigation/UserNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { MemberAuthProvider } from '@/context/MemberAuthContext';
import { APP_VARIANT } from '@/config/variant';

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {APP_VARIANT === 'user' ? (
            <MemberAuthProvider>
              <UserNavigator />
              <StatusBar style="dark" />
            </MemberAuthProvider>
          ) : (
            <AuthProvider>
              <AppNavigator />
              <StatusBar style="dark" />
            </AuthProvider>
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
