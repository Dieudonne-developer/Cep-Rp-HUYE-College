import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';

export const AnointedAboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const aboutContent = `Anointed Worship Team is dedicated to leading the congregation in worship through powerful music and heartfelt praise. We believe that worship is not just singing songs, but entering into the presence of God and experiencing His glory.

Our team is composed of talented musicians and vocalists who are called to minister through music. We are committed to excellence in our craft while maintaining a spirit of humility and servanthood.

We believe that music has the power to touch hearts, heal brokenness, and bring people closer to God. Through our worship, we aim to create an atmosphere where people can encounter God in a deep and meaningful way.

Our mission is to lead worship that is both spiritually edifying and musically excellent. We strive to balance tradition with contemporary styles, ensuring that our worship is accessible to all generations while maintaining a deep reverence for God.

Join us as we worship together and experience the transforming power of praise!`;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView style={styles.scroll}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Anointed Worship Team</Text>
          <Text style={styles.subtitle}>Worship Ministry of CEP RP Huye College</Text>
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
