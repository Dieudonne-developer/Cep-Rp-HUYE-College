import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { ChoirAboutScreen } from './ChoirAboutScreen';
import { ChoirMediaScreen } from './ChoirMediaScreen';
import { ChoirActivitiesScreen } from './ChoirActivitiesScreen';
import { ChoirIdeasScreen } from './ChoirIdeasScreen';
import { ChoirSupportScreen } from './ChoirSupportScreen';
import { ChoirWhatsAppScreen } from './ChoirWhatsAppScreen';
import { ChoirAttendanceScreen } from './ChoirAttendanceScreen';

const Tab = createBottomTabNavigator();

export const ChoirTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#2735F5',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        height: 88,
        paddingBottom: 88,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Feather.glyphMap> = {
          About: 'info',
          Media: 'video',
          Activities: 'calendar',
          Ideas: 'zap',
          Support: 'heart',
          WhatsApp: 'message-circle',
          Attendance: 'check-circle',
        };
        return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="About" component={ChoirAboutScreen} options={{ title: 'About' }} />
    <Tab.Screen name="Media" component={ChoirMediaScreen} options={{ title: 'Media' }} />
    <Tab.Screen name="Activities" component={ChoirActivitiesScreen} options={{ title: 'Activities' }} />
    <Tab.Screen name="Ideas" component={ChoirIdeasScreen} options={{ title: 'Ideas' }} />
    <Tab.Screen name="Support" component={ChoirSupportScreen} options={{ title: 'Support' }} />
    <Tab.Screen name="WhatsApp" component={ChoirWhatsAppScreen} options={{ title: 'WhatsApp' }} />
    <Tab.Screen name="Attendance" component={ChoirAttendanceScreen} options={{ title: 'Attendance' }} />
  </Tab.Navigator>
);
