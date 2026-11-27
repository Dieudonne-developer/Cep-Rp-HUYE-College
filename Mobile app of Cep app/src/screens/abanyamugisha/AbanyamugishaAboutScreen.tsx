import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';

export const AbanyamugishaAboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const aboutContent = `Abanyamugisha Family is a community of believers who come together to worship, fellowship, and serve God. The name "Abanyamugisha" means "those who have been sent" or "those who have been blessed."

We believe that every member has been called and equipped by God for a specific purpose. Through our community, we support each other in discovering and fulfilling our calling.

Our mission is to create an environment where people can grow in their faith, develop their gifts, and use them to serve others. We believe that the church is not just a building, but a family of believers who care for one another.

Join us as we grow together in faith and serve the Lord with all our hearts!`;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView style={styles.scroll}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Abanyamugisha Family</Text>
          <Text style={styles.subtitle}>Those Who Have Been Sent and Blessed</Text>
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
