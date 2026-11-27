import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';

export const Psalm23AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const aboutContent = `Psalm 23 Family is dedicated to living out the truths of Psalm 23 in our daily lives. "The Lord is my shepherd, I shall not want" - this verse guides our community as we walk together in faith.

We believe that God is our provider, protector, and guide. Through worship, fellowship, and service, we strive to experience the fullness of God's provision and guidance in our lives.

Our mission is to help each member discover their identity in Christ and live according to God's Word. We focus on spiritual growth, community building, and serving others with the love of Christ.

Join us as we walk together in faith, trusting in the Lord as our shepherd who guides us through every season of life.`;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView style={styles.scroll}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Psalm 23 Family</Text>
          <Text style={styles.subtitle}>Walking in Faith with Christ as Our Shepherd</Text>
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
