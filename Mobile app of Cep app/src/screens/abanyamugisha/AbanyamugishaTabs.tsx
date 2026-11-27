import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { AbanyamugishaAboutScreen } from './AbanyamugishaAboutScreen';
import { AbanyamugishaMediaScreen } from './AbanyamugishaMediaScreen';
import { AbanyamugishaActivitiesScreen } from './AbanyamugishaActivitiesScreen';
import { AbanyamugishaPrayerRequestsScreen } from './AbanyamugishaPrayerRequestsScreen';
import { AbanyamugishaSupportScreen } from './AbanyamugishaSupportScreen';
import { AbanyamugishaWhatsAppScreen } from './AbanyamugishaWhatsAppScreen';

const Tab = createBottomTabNavigator();

export const AbanyamugishaTabs: React.FC = () => (
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
        paddingBottom: 80,
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
          PrayerRequests: 'heart',
          Support: 'heart',
          WhatsApp: 'message-circle',
        };
        return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="About" component={AbanyamugishaAboutScreen} options={{ title: 'About' }} />
    <Tab.Screen name="Media" component={AbanyamugishaMediaScreen} options={{ title: 'Media' }} />
    <Tab.Screen name="Activities" component={AbanyamugishaActivitiesScreen} options={{ title: 'Activities' }} />
    <Tab.Screen name="PrayerRequests" component={AbanyamugishaPrayerRequestsScreen} options={{ title: 'Prayer' }} />
    <Tab.Screen name="Support" component={AbanyamugishaSupportScreen} options={{ title: 'Support' }} />
    <Tab.Screen name="WhatsApp" component={AbanyamugishaWhatsAppScreen} options={{ title: 'WhatsApp' }} />
  </Tab.Navigator>
);
