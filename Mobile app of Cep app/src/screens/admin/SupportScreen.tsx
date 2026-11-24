import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchSupportItems, createSupportItem, deleteSupportItem } from '@/services/adminService';
export const SupportScreen: React.FC = () => {
  const { admin } = useAuth(); const [items,setItems]=useState<any[]>([]); const [f,setF]=useState({kind:'other',title:'',content:'',link:''});
  const load=useCallback(async()=>{if(!admin)return;try{setItems(await fetchSupportItems(admin));}catch{}},[admin]);
  useEffect(()=>{load()},[load]);
  const add=async()=>{if(!f.title.trim())return;try{await createSupportItem(admin!,{kind:f.kind,title:f.title,content:f.content,link:f.link||undefined});setF({kind:'other',title:'',content:'',link:''});load();}catch(e:any){Alert.alert('Error',e?.message||'Failed')}};
  return <View style={s.c}><Text style={s.t}>Support Info</Text>
    <View style={s.form}><TextInput style={s.in} placeholder="Title *" value={f.title} onChangeText={v=>setF({...f,title:v})}/><TextInput style={s.in} placeholder="Content / details" value={f.content} onChangeText={v=>setF({...f,content:v})} multiline/><TextInput style={s.in} placeholder="Link (optional)" value={f.link} onChangeText={v=>setF({...f,link:v})}/><TouchableOpacity style={s.btn} onPress={add}><Text style={s.btnT}>Publish</Text></TouchableOpacity></View>
    <FlatList data={items} keyExtractor={(i,x)=>String(i._id||i.id||x)} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />} ListEmptyComponent={<Text style={s.empty}>No support items.</Text>} renderItem={({item})=>(
      <View style={s.card}><View style={{flex:1}}><Text style={s.ct}>{item.title}</Text>{item.content?<Text style={s.cm}>{item.content}</Text>:null}{item.link?<TouchableOpacity onPress={()=>Linking.openURL(item.link)}><Text style={s.link}>Open link</Text></TouchableOpacity>:null}</View>
      <TouchableOpacity onPress={()=>{if(confirm('Delete?'))deleteSupportItem(admin!,item._id||item.id).then(load)}}><Text style={s.del}>Delete</Text></TouchableOpacity></View>)} /></View>;
};
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#f8fafc',padding:16},t:{fontSize:22,fontWeight:'800',color:'#1e293b',marginBottom:10},form:{backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:10,borderWidth:1,borderColor:'#e2e8f0'},in:{borderWidth:1,borderColor:'#cbd5e1',borderRadius:8,padding:10,marginBottom:8},btn:{backgroundColor:'#2563eb',borderRadius:10,padding:12,alignItems:'center'},btnT:{color:'#fff',fontWeight:'700'},card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#e2e8f0',alignItems:'center'},ct:{fontWeight:'700',color:'#1e293b'},cm:{fontSize:12,color:'#64748b',marginTop:2},link:{color:'#2563eb',fontSize:12,marginTop:4},del:{color:'#dc2626',fontWeight:'700'},empty:{textAlign:'center',color:'#64748b',marginTop:30}});
