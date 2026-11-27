import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { SuperAdminDashboardScreen } from '@/screens/admin/SuperAdminDashboardScreen';
import { WhatsAppScreen } from '@/screens/admin/WhatsAppScreen';
import { ManageAdminsScreen } from '@/screens/admin/ManageAdminsScreen';
import { CepMembersScreen } from '@/screens/admin/CepMembersScreen';
import { GlobalActivitiesScreen } from '@/screens/admin/GlobalActivitiesScreen';
import { GlobalIdeasScreen } from '@/screens/admin/GlobalIdeasScreen';
import { GlobalSupportScreen } from '@/screens/admin/GlobalSupportScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Homepage navigator with nested tabs for Activities, Ideas, Support
const HomepageTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Feather.glyphMap> = {
            Activities: 'calendar',
            Ideas: 'star',
            Support: 'heart'
          };
          return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Activities" component={GlobalActivitiesScreen} options={{ title: 'Activities' }} />
      <Tab.Screen name="Ideas" component={GlobalIdeasScreen} options={{ title: 'Ideas' }} />
      <Tab.Screen name="Support" component={GlobalSupportScreen} options={{ title: 'Support' }} />
    </Tab.Navigator>
  );
};

export const SuperAdminNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Feather.glyphMap> = {
            Dashboard: 'home',
            WhatsApp: 'message-circle',
            ManageAdmins: 'users',
            Homepage: 'grid',
            CepMembers: 'user-check',
            Settings: 'settings'
          };
          return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={SuperAdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="WhatsApp" component={WhatsAppScreen} options={{ title: 'WhatsApp' }} />
      <Tab.Screen name="ManageAdmins" component={ManageAdminsScreen} options={{ title: 'Manage Admins' }} />
      <Tab.Screen name="Homepage" component={HomepageTabNavigator} options={{ title: 'Homepage' }} />
      <Tab.Screen name="CepMembers" component={CepMembersScreen} options={{ title: 'CEP Members' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};
