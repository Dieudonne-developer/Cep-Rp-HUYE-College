import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { FamilyAboutScreen } from './FamilyAboutScreen';
import { FamilyMediaScreen } from './FamilyMediaScreen';
import { FamilyActivitiesScreen } from './FamilyActivitiesScreen';
import { FamilyIdeasScreen } from './FamilyIdeasScreen';
import { FamilySupportScreen } from './FamilySupportScreen';
import { FamilyWhatsAppScreen } from './FamilyWhatsAppScreen';

interface FamilyTabs6Props {
  group: string;
  groupLabel: string;
}

export const FamilyTabs6: React.FC<FamilyTabs6Props> = ({ group, groupLabel }) => {
  const Tab = createBottomTabNavigator();

  return (
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
            Ideas: 'zap',
            Support: 'heart',
            WhatsApp: 'message-circle',
          };
          return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="About" options={{ title: 'About' }}>
        {(props) => <FamilyAboutScreen {...props} group={group} groupLabel={groupLabel} />}
      </Tab.Screen>
      <Tab.Screen name="Media" options={{ title: 'Media' }}>
        {(props) => <FamilyMediaScreen {...props} group={group} groupLabel={groupLabel} />}
      </Tab.Screen>
      <Tab.Screen name="Activities" options={{ title: 'Activities' }}>
        {(props) => <FamilyActivitiesScreen {...props} group={group} groupLabel={groupLabel} />}
      </Tab.Screen>
      <Tab.Screen name="Ideas" options={{ title: 'Ideas' }}>
        {(props) => <FamilyIdeasScreen {...props} group={group} groupLabel={groupLabel} />}
      </Tab.Screen>
      <Tab.Screen name="Support" options={{ title: 'Support' }}>
        {(props) => <FamilySupportScreen {...props} group={group} groupLabel={groupLabel} />}
      </Tab.Screen>
      <Tab.Screen name="WhatsApp" options={{ title: 'WhatsApp' }}>
        {(props) => <FamilyWhatsAppScreen {...props} group={group} groupLabel={groupLabel} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
