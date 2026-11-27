import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ScreenHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#3590F3'
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' }
});
