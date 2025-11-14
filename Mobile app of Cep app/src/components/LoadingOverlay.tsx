import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  text?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ text }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#2563eb" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  }
});


