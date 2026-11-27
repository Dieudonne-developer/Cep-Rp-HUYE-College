import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { AttendanceScreen } from '@/screens/member/AttendanceScreen';
import { AttendanceLoginScreen } from '@/screens/member/AttendanceLoginScreen';
import { ActivitiesScreen } from '@/screens/member/ActivitiesScreen';
import { SettingsScreen } from '@/screens/member/SettingsScreen';
import { SideBar } from '@/components/SideBar';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { CepAboutScreen } from '@/screens/cep/CepAboutScreen';
import { CepActivitiesScreen } from '@/screens/cep/CepActivitiesScreen';
import { CepSupportScreen } from '@/screens/cep/CepSupportScreen';
import { CepIdeasScreen } from '@/screens/cep/CepIdeasScreen';
import { CepWhatsAppScreen } from '@/screens/cep/CepWhatsAppScreen';
import { ChoirTabs } from '@/screens/choir/ChoirTabs';
import { AnointedTabs } from '@/screens/anointed/AnointedTabs';
import { AbanyamugishaTabs } from '@/screens/abanyamugisha/AbanyamugishaTabs';
import { FamilyTabs6 } from '@/screens/families/FamilyTabs6';
import { GroupContentScreen } from '@/screens/GroupContentScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const FAMILY_LABELS: Record<string, string> = {
  anointed: 'Anointed Worship Team',
  abanyamugisha: 'Abanyamugisha Family',
  psalm23: 'Psalm 23 Family',
  psalm46: 'Psalm 46 Family',
  protocol: 'Protocol Family',
  social: 'Social Family',
  evangelical: 'Evangelical Family',
};

const CepTabs = () => (
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
        fontSize: 12,
        fontWeight: '600',
      },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Feather.glyphMap> = {
          About: 'info',
          Activities: 'calendar',
          Support: 'heart',
          Ideas: 'zap',
          WhatsApp: 'message-circle',
        };
        return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="About" component={CepAboutScreen} options={{ title: 'About' }} />
    <Tab.Screen name="Activities" component={CepActivitiesScreen} options={{ title: 'Activities' }} />
    <Tab.Screen name="Support" component={CepSupportScreen} options={{ title: 'Support' }} />
    <Tab.Screen name="Ideas" component={CepIdeasScreen} options={{ title: 'Ideas' }} />
    <Tab.Screen name="WhatsApp" component={CepWhatsAppScreen} options={{ title: 'WhatsApp' }} />
  </Tab.Navigator>
);

const HomeScreen = () => {
  const [selectedGroup, setSelectedGroup] = useState('cepier');

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
      }}
      drawerContent={(props) => (
        <SideBar
          selectedGroup={selectedGroup}
          onGroupSelect={setSelectedGroup}
          onClose={() => props.navigation.closeDrawer()}
        />
      )}
    >
      <Drawer.Screen name="GroupContent">
        {(drawerProps) => {
          if (selectedGroup === 'cepier') {
            return <CepTabs />;
          } else if (selectedGroup === 'choir') {
            return <ChoirTabs />;
          } else if (selectedGroup === 'anointed') {
            return <AnointedTabs />;
          } else if (selectedGroup === 'abanyamugisha') {
            return <AbanyamugishaTabs />;
          } else if (['psalm23', 'psalm46', 'protocol', 'social', 'evangelical'].includes(selectedGroup)) {
            return (
              <FamilyTabs6
                group={selectedGroup}
                groupLabel={FAMILY_LABELS[selectedGroup]}
              />
            );
          } else {
            return (
              <GroupContentScreen
                group={selectedGroup}
                onMenuPress={() => drawerProps.navigation.openDrawer()}
              />
            );
          }
        }}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export const UserNavigator: React.FC = () => {
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

  if (showWelcome === null) return <LoadingOverlay />;

  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f8fafc' } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome ? (
          <Stack.Screen name="Welcome">
            {() => <WelcomeScreen onContinue={handleWelcomeComplete} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={HomeScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="AttendanceLogin" component={AttendanceLoginScreen} />
            <Stack.Screen name="Activities" component={ActivitiesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
