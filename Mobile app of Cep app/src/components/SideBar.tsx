import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const GROUPS: { key: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'cepier', label: 'CEP', icon: 'home' },
  { key: 'choir', label: 'Choir', icon: 'music' },
  { key: 'anointed', label: 'Anointed', icon: 'star' },
  { key: 'abanyamugisha', label: 'Abanyamugisha', icon: 'users' },
  { key: 'psalm23', label: 'Psalm23', icon: 'book' },
  { key: 'psalm46', label: 'Psalm46', icon: 'shield' },
  { key: 'protocol', label: 'Protocol', icon: 'check-circle' },
  { key: 'social', label: 'Social', icon: 'message-circle' },
  { key: 'evangelical', label: 'Evangelical', icon: 'globe' },
];

interface SideBarProps {
  selectedGroup: string;
  onGroupSelect: (group: string) => void;
  onClose: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({ selectedGroup, onGroupSelect, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/sidebar.png')} style={styles.headerImage} />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>CEP RP HUYE COLLEGE</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Family</Text>
        </View>

        {GROUPS.map((group) => (
          <TouchableOpacity
            key={group.key}
            style={[styles.menuItem, selectedGroup === group.key && styles.menuItemActive]}
            onPress={() => {
              onGroupSelect(group.key);
              onClose();
            }}
          >
            <Feather
              name={group.icon}
              size={20}
              color={selectedGroup === group.key ? '#2735F5' : '#64748b'}
            />
            <Text
              style={[styles.menuItemText, selectedGroup === group.key && styles.menuItemTextActive]}
            >
              {group.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 180,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(39, 53, 245, 0.85)',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2735F5',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    marginLeft: 12,
  },
  menuItemTextActive: {
    color: '#2735F5',
    fontWeight: '600',
  },
});
