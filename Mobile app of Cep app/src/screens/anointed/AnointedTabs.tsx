import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { AnointedAboutScreen } from './AnointedAboutScreen';
import { AnointedMediaScreen } from './AnointedMediaScreen';
import { AnointedActivitiesScreen } from './AnointedActivitiesScreen';
import { AnointedIdeasScreen } from './AnointedIdeasScreen';
import { AnointedSupportScreen } from './AnointedSupportScreen';
import { AnointedWhatsAppScreen } from './AnointedWhatsAppScreen';
import { AnointedAttendanceScreen } from './AnointedAttendanceScreen';

const Tab = createBottomTabNavigator();

export const AnointedTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#2735F5',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        height: 80,
        paddingBottom: 72,
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
    <Tab.Screen name="About" component={AnointedAboutScreen} options={{ title: 'About' }} />
    <Tab.Screen name="Media" component={AnointedMediaScreen} options={{ title: 'Media' }} />
    <Tab.Screen name="Activities" component={AnointedActivitiesScreen} options={{ title: 'Activities' }} />
    <Tab.Screen name="Ideas" component={AnointedIdeasScreen} options={{ title: 'Ideas' }} />
    <Tab.Screen name="Support" component={AnointedSupportScreen} options={{ title: 'Support' }} />
    <Tab.Screen name="WhatsApp" component={AnointedWhatsAppScreen} options={{ title: 'WhatsApp' }} />
    <Tab.Screen name="Attendance" component={AnointedAttendanceScreen} options={{ title: 'Attendance' }} />
  </Tab.Navigator>
);
