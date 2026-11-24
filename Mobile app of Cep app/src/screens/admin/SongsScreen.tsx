import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchSongs, deleteSong } from '@/services/adminService';
export const SongsScreen: React.FC = () => {
  const { admin } = useAuth(); const [items,setItems]=useState<any[]>([]);
  const load=useCallback(async()=>{if(!admin)return;try{setItems(await fetchSongs(admin));}catch{}},[admin]);
  useEffect(()=>{load()},[load]);
  return <View style={s.c}><Text style={s.t}>Songs</Text>
    <FlatList data={items} keyExtractor={(i,x)=>String(i._id||x)} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />} ListEmptyComponent={<Text style={s.empty}>No songs.</Text>} renderItem={({item})=>(
      <View style={s.card}><View style={{flex:1}}><Text style={s.ct}>{item.title||item.name||'Song'}</Text><Text style={s.cm}>{item.artist||''}</Text></View>
      {(item.url||item.fileUrl)&&( <TouchableOpacity onPress={()=>Linking.openURL(item.url||item.fileUrl)}><Text style={s.play}>Play</Text></TouchableOpacity>)}
      <TouchableOpacity onPress={()=>{if(confirm('Delete?'))deleteSong(admin!,item._id).then(load)}}><Text style={s.del}>Delete</Text></TouchableOpacity></View>)} /></View>;
};
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#f8fafc',padding:16},t:{fontSize:22,fontWeight:'800',color:'#1e293b',marginBottom:10},card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#e2e8f0',alignItems:'center',gap:10},ct:{fontWeight:'700',color:'#1e293b'},cm:{fontSize:12,color:'#64748b'},play:{color:'#2563eb',fontWeight:'700'},del:{color:'#dc2626',fontWeight:'700'},empty:{textAlign:'center',color:'#64748b',marginTop:30}});
