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
import { EventsScreen } from '@/screens/admin/EventsScreen';
import { SongsScreen } from '@/screens/admin/SongsScreen';
import { SupportScreen } from '@/screens/admin/SupportScreen';
import { WhatsAppScreen } from '@/screens/admin/WhatsAppScreen';
import { AdminAttendanceScreen } from '@/screens/admin/AttendanceScreen';
import { SuperAdminsScreen } from '@/screens/admin/SuperAdminsScreen';
import { MoreScreen } from '@/screens/admin/MoreScreen';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export type RootStackParamList = { Auth: undefined; Main: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();
const Stack2 = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const FeatureStack = () => (
  <Stack2.Navigator screenOptions={{ headerShown: false }}>
    <Stack2.Screen name="More" component={MoreScreen} />
    <Stack2.Screen name="Events" component={EventsScreen} />
    <Stack2.Screen name="Songs" component={SongsScreen} />
    <Stack2.Screen name="Support" component={SupportScreen} />
    <Stack2.Screen name="WhatsApp" component={WhatsAppScreen} />
    <Stack2.Screen name="Attendance" component={AdminAttendanceScreen} />
    <Stack2.Screen name="SuperAdmins" component={SuperAdminsScreen} />
  </Stack2.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Feather.glyphMap> = {
          Dashboard: 'home', Members: 'users', Ideas: 'message-circle', Features: 'grid', Settings: 'settings'
        };
        return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Members" component={MembersScreen} />
    <Tab.Screen name="Ideas" component={IdeasScreen} />
    <Tab.Screen name="Features" component={FeatureStack} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { admin, loading } = useAuth();
  if (loading) return <LoadingOverlay />;
  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f8fafc' } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {admin ? <Stack.Screen name="Main" component={AppTabs} /> : <Stack.Screen name="Auth" component={LoginScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
