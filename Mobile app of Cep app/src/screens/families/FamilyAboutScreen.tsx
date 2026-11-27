import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';

interface FamilyAboutScreenProps {
  group: string;
  groupLabel: string;
}

export const FamilyAboutScreen: React.FC<FamilyAboutScreenProps> = ({ group, groupLabel }) => {
  const navigation = useNavigation();

  const aboutContent = `${groupLabel} is part of CEP RP Huye College. This family group is dedicated to serving God through worship, fellowship, and ministry.

We are committed to building strong relationships with God and with each other. Through regular meetings, worship sessions, and community outreach, we strive to make a positive impact on the lives of our members and the wider community.

Our mission is to glorify God through our daily lives and to support each other in our spiritual journey. We believe that together, we can accomplish great things for the Kingdom of God.

Join us as we grow together in faith and serve the Lord with all our hearts!`;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView style={styles.scroll}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{groupLabel}</Text>
          <Text style={styles.subtitle}>Family Group of CEP RP Huye College</Text>
        </View>

        <View style={styles.content}>
          {aboutContent.split('\n\n').map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 16,
  },
});
