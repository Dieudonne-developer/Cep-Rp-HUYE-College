import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { MembersScreen } from '@/screens/MembersScreen';
import { IdeasScreen } from '@/screens/IdeasScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        borderTopWidth: 0,
        elevation: 0
      },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Feather.glyphMap> = {
          Dashboard: 'home',
          Members: 'users',
          Ideas: 'message-circle',
          Settings: 'settings'
        };
        const iconName = icons[route.name] || 'circle';
        return <Feather name={iconName} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Members" component={MembersScreen} />
    <Tab.Screen name="Ideas" component={IdeasScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { admin, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#f8fafc'
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {admin ? (
          <Stack.Screen name="Main" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


