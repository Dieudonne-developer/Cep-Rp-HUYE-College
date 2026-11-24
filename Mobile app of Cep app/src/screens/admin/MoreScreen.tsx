import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const ITEMS=[['Events','Events'],['Songs','Songs'],['Support','Support'],['WhatsApp','WhatsApp'],['Attendance','Attendance'],['Super Admin','SuperAdmins']];
export const MoreScreen: React.FC = () => {
  const nav:any=useNavigation();
  return <View style={s.c}><Text style={s.t}>All Features</Text>{ITEMS.map(([label,route])=>(<TouchableOpacity key={route} style={s.item} onPress={()=>nav.navigate(route)}><Text style={s.it}>{label}</Text><Text style={s.arrow}>›</Text></TouchableOpacity>))}</View>;
};
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#f8fafc',padding:16},t:{fontSize:22,fontWeight:'800',color:'#1e293b',marginBottom:12},item:{flexDirection:'row',backgroundColor:'#fff',borderRadius:12,padding:16,marginBottom:8,borderWidth:1,borderColor:'#e2e8f0',alignItems:'center',justifyContent:'space-between'},it:{fontSize:16,fontWeight:'600',color:'#1e293b'},arrow:{fontSize:20,color:'#94a3b8'}});
