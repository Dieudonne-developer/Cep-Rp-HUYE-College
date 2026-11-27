import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';

export const ChoirAboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const aboutContent = `Ishyanga Ryera Choir is the worship team of CEP RP Huye College. This choir was founded with a passion to bring glory to God through music and praise.

But you are a chosen people, a royal priesthood, a holy nation, God's own possession, that you may declare the praises of Him who called you out of darkness into His wonderful light — 1 Peter 2:9

Our mission is to lead the congregation in worship through powerful songs and hymns that touch hearts and transform lives. We believe that music is a powerful tool for ministry and that through worship, we can experience God's presence in a profound way.

The choir ministers through:
- Leading worship during church services
- Organizing special musical events and concerts
- Teaching and mentoring new musicians
- Recording and sharing music to reach wider audiences
- Participating in community outreach through music

We are committed to excellence in musicianship and spiritual growth. Our members undergo regular training to improve their vocal skills and deepen their understanding of worship. We believe that skill without spirit is empty, and spirit without skill is limited.

Join us as we worship together and experience the transformative power of praise!`;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView style={styles.scroll}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Ishyanga Ryera Choir</Text>
          <Text style={styles.subtitle}>Worship Team of CEP RP Huye College</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.bibleVerse}>
            "But you are a chosen people, a royal priesthood, a holy nation, God's own possession, that you may declare the praises of Him who called you out of darkness into His wonderful light — 1 Peter 2:9"
          </Text>

          <View style={styles.divider} />

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
  bibleVerse: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 16,
  },
});
