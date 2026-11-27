import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';

export const CepAboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const aboutContent = `CEP RP Huye (Communauté des Étudiants Pentecôtistes à RP Huye) is a fellowship of Pentecostal students who serve and worship God at RP Huye College. The community was founded in 2015, when new students joined the college and felt the need to create a place where they could worship freely and grow spiritually together.

Among those students were three Pentecostals, including UWIZEYE Innocent, who were filled with the Holy Spirit and inspired to start a Christian fellowship on campus. They believed that the gift of salvation and the message of Christ within them should not be kept hidden. With this conviction, they began to meet for prayer, worship, and Bible study — and that is how CEP RP Huye was born.

Over the years, the fellowship has continued to grow in both number and spiritual strength. More students have joined, finding in CEP RP Huye a spiritual home that helps them build their faith, develop their gifts, and share the love of Christ with others. Through the guidance of the Holy Spirit, the community has become a vibrant center of worship, prayer, and evangelism within the college.

The main mission of CEP RP Huye is to expand God's Kingdom within the campus through evangelism, worship, prayer, and acts of love. Members support each other spiritually, emotionally, and even academically. They visit the sick, pray for one another, and stand together as a true family in Christ.

The community is built on strong Christian values — love, humility, service, and faithfulness. CEP RP Huye operates through different ministries such as choirs, worship teams, prayer groups, and social outreach teams, all working together to glorify God and strengthen the body of Christ.

Today, CEP RP Huye has had a powerful impact on the lives of many students at RP Huye College. Those who have been part of the fellowship are known for their integrity, faith, and passion for serving God wherever they go. The community continues to conduct evangelism, prayer sessions, charity work, and discipleship programs, all aimed at transforming lives and making true disciples of Jesus Christ.

CEP RP Huye remains a shining light at RP Huye College — a place where students are nurtured in faith, trained to lead with Christian values, and inspired to live for Christ both on campus and beyond.`;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => {}} />}
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: `${API_BASE_URL}/api/assets/logo` }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>CEP RP Huye</Text>
          <Text style={styles.subtitle}>The Pentecostal Students' Community at RP Huye College</Text>

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
  logoContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    width: 100,
    height: 100,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
