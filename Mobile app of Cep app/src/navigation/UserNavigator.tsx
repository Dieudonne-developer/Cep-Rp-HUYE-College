import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { MemberLoginScreen } from '@/screens/member/MemberLoginScreen';
import { AttendanceScreen } from '@/screens/member/AttendanceScreen';
import { ActivitiesScreen } from '@/screens/member/ActivitiesScreen';
import { SettingsScreen } from '@/screens/member/SettingsScreen';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MemberTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Feather.glyphMap> = {
          Attendance: 'check-circle',
          Activities: 'grid',
          Settings: 'settings'
        };
        return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
    <Tab.Screen name="Activities" component={ActivitiesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const UserNavigator: React.FC = () => {
  const { user, loading } = useMemberAuth();
  if (loading) return <LoadingOverlay />;
  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f8fafc' } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? <Stack.Screen name="Main" component={MemberTabs} /> : <Stack.Screen name="Auth" component={MemberLoginScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
