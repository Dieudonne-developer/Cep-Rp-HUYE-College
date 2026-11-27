import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AppHeaderProps {
  onMenuPress: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Feather name="menu" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.title}>CEP RP HUYE COLLEGE</Text>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2735F5',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
});
