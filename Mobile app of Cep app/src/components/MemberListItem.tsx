import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Member } from '@/types';

interface Props {
  member: Member;
  onApprove?: (member: Member) => void;
  onReject?: (member: Member) => void;
  showActions?: boolean;
}

export const MemberListItem: React.FC<Props> = ({ member, onApprove, onReject, showActions }) => {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{member.username || member.email}</Text>
        <Text style={styles.email}>{member.email}</Text>
        <Text style={styles.meta}>
          {member.isApproved ? 'Approved' : 'Pending'} · {member.userGroup || 'Unknown group'}
        </Text>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.approve]}
            onPress={() => onApprove?.(member)}
          >
            <Text style={styles.actionText}>Approve</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.reject]} onPress={() => onReject?.(member)}>
            <Text style={styles.actionText}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 16
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  email: {
    fontSize: 14,
    color: '#475569'
  },
  meta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  actions: {
    justifyContent: 'center',
    gap: 8
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  approve: {
    backgroundColor: '#dcfce7'
  },
  reject: {
    backgroundColor: '#fee2e2'
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a'
  }
});


