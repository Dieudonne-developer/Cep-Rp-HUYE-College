import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchWhatsAppGroups, fetchWhatsAppRequests, decideWhatsAppRequest } from '@/services/adminService';
export const WhatsAppScreen: React.FC = () => {
  const { admin } = useAuth(); const [groups,setGroups]=useState<any[]>([]); const [reqs,setReqs]=useState<any[]>([]);
  const load=useCallback(async()=>{if(!admin)return;try{const[g,r]=await Promise.all([fetchWhatsAppGroups(admin),fetchWhatsAppRequests(admin)]);setGroups(g);setReqs(r);}catch{}},[admin]);
  useEffect(()=>{load()},[load]);
  const decide=async(id:string,ok:boolean)=>{try{await decideWhatsAppRequest(admin!,id,ok);load();}catch(e:any){Alert.alert('Error',e?.message||'Failed')}};
  return <View style={s.c}><Text style={s.t}>WhatsApp</Text>
    <Text style={s.sec}>Access Requests</Text>
    <FlatList data={reqs} keyExtractor={(i,x)=>String(i._id||i.id||x)} ListEmptyComponent={<Text style={s.empty}>No pending requests.</Text>} renderItem={({item})=>(
      <View style={s.card}><View style={{flex:1}}><Text style={s.ct}>{item.name||item.username||item.email}</Text><Text style={s.cm}>{item.contactNumber||item.phone||item.email||''}</Text></View>
      <TouchableOpacity style={s.ok} onPress={()=>decide(item._id||item.id,true)}><Text style={s.okT}>Approve</Text></TouchableOpacity>
      <TouchableOpacity style={s.no} onPress={()=>decide(item._id||item.id,false)}><Text style={s.noT}>Reject</Text></TouchableOpacity></View>)} />
    <Text style={s.sec}>Groups</Text>
    {groups.map((g:any)=>(<View key={g._id||g.id||g.name} style={s.card}><View style={{flex:1}}><Text style={s.ct}>{g.name}</Text><Text style={s.cm}>{g.description||''}</Text></View><Text style={g.inviteLink||g.invite_link?s.link:s.cm}>{g.inviteLink||g.invite_link?'Link set':'No link'}</Text></View>))}
    {groups.length===0&&<Text style={s.empty}>No groups.</Text>}
  </View>;
};
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#f8fafc',padding:16},t:{fontSize:22,fontWeight:'800',color:'#1e293b',marginBottom:10},sec:{fontSize:15,fontWeight:'700',color:'#334155',marginTop:12,marginBottom:6},card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#e2e8f0',alignItems:'center',gap:8},ct:{fontWeight:'700',color:'#1e293b',flex:1},cm:{fontSize:12,color:'#64748b'},link:{color:'#16a34a',fontSize:12,fontWeight:'600'},ok:{backgroundColor:'#16a34a',paddingHorizontal:12,paddingVertical:8,borderRadius:8},okT:{color:'#fff',fontWeight:'700',fontSize:12},no:{backgroundColor:'#dc2626',paddingHorizontal:12,paddingVertical:8,borderRadius:8},noT:{color:'#fff',fontWeight:'700',fontSize:12},empty:{textAlign:'center',color:'#64748b',marginVertical:10}});
