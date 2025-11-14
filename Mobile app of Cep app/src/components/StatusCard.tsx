import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: number | string;
  accentColor?: string;
}

export const StatusCard: React.FC<Props> = ({ label, value, accentColor = '#2563eb' }) => (
  <View style={[styles.card, { borderColor: accentColor }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#fff',
    gap: 8
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500'
  },
  value: {
    fontSize: 24,
    fontWeight: '700'
  }
});


