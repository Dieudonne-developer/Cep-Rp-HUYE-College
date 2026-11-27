import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
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
import { SuperAdminNavigator } from '@/navigation/SuperAdminNavigator';

export type RootStackParamList = { Welcome: undefined; Auth: undefined; Main: undefined };
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
          Dashboard: 'home',
          Events: 'calendar',
          Songs: 'music',
          Members: 'users',
          Ideas: 'star',
          Support: 'heart',
          WhatsApp: 'message-circle',
          Attendance: 'check-circle',
          Settings: 'settings'
        };
        return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="Events" component={EventsScreen} options={{ title: 'Events' }} />
    <Tab.Screen name="Songs" component={SongsScreen} options={{ title: 'Songs' }} />
    <Tab.Screen name="Members" component={MembersScreen} options={{ title: 'Members' }} />
    <Tab.Screen name="Ideas" component={IdeasScreen} options={{ title: 'Ideas' }} />
    <Tab.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
    <Tab.Screen name="WhatsApp" component={WhatsAppScreen} options={{ title: 'WhatsApp' }} />
    <Tab.Screen name="Attendance" component={AdminAttendanceScreen} options={{ title: 'Attendance' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { admin, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenWelcome').then(value => {
      setShowWelcome(value !== 'true');
    });
  }, []);

  const handleWelcomeComplete = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  if (loading || showWelcome === null) return <LoadingOverlay />;

  const isSuperAdmin = admin?.role === 'super-admin';

  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f8fafc' } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome ? (
          <Stack.Screen name="Welcome">
            {() => <WelcomeScreen onContinue={handleWelcomeComplete} />}
          </Stack.Screen>
        ) : admin ? (
          <Stack.Screen name="Main">
            {() => isSuperAdmin ? <SuperAdminNavigator /> : <AppTabs />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
