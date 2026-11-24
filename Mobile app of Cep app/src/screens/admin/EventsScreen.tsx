import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchEvents, createEvent, deleteEvent } from '@/services/adminService';

export const EventsScreen: React.FC = () => {
  const { admin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', location: '' });
  const [showForm, setShowForm] = useState(false);
  const load = useCallback(async () => { if (!admin) return; try { setItems(await fetchEvents(admin)); } catch {} }, [admin]);
  useEffect(() => { load(); }, [load]);
  const add = async () => {
    if (!form.title.trim()) return;
    try { await createEvent(admin!, { ...form, eventDate: form.eventDate || undefined }); setForm({ title:'', description:'', eventDate:'', location:'' }); setShowForm(false); load(); }
    catch (e:any) { Alert.alert('Error', e?.message || 'Failed'); }
  };
  return (
    <View style={s.c}>
      <Text style={s.t}>Activities / Events</Text>
      <TouchableOpacity style={s.btn} onPress={() => setShowForm(!showForm)}><Text style={s.btnT}>{showForm ? 'Close' : '+ Add Event'}</Text></TouchableOpacity>
      {showForm && (
        <View style={s.form}>
          <TextInput style={s.in} placeholder="Title *" value={form.title} onChangeText={v=>setForm({...form,title:v})} />
          <TextInput style={s.in} placeholder="Date (YYYY-MM-DD)" value={form.eventDate} onChangeText={v=>setForm({...form,eventDate:v})} />
          <TextInput style={s.in} placeholder="Location" value={form.location} onChangeText={v=>setForm({...form,location:v})} />
          <TextInput style={s.in} placeholder="Description" value={form.description} onChangeText={v=>setForm({...form,description:v})} multiline />
          <TouchableOpacity style={s.btn} onPress={add}><Text style={s.btnT}>Save</Text></TouchableOpacity>
        </View>
      )}
      <FlatList data={items} keyExtractor={(i,x)=>String(i._id||x)} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />} ListEmptyComponent={<Text style={s.empty}>No events.</Text>} renderItem={({item})=>(
        <View style={s.card}><View style={{flex:1}}><Text style={s.ct}>{item.title}</Text><Text style={s.cm}>{item.location||''} {item.eventDate||item.date? '• '+new Date(item.eventDate||item.date).toLocaleDateString():''}</Text></View>
        <TouchableOpacity onPress={()=>{if(confirm('Delete?'))deleteEvent(admin!,item._id).then(load)}}><Text style={s.del}>Delete</Text></TouchableOpacity></View>)} />
    </View>
  );
};
const s = StyleSheet.create({ c:{flex:1,backgroundColor:'#f8fafc',padding:16}, t:{fontSize:22,fontWeight:'800',color:'#1e293b',marginBottom:10}, btn:{backgroundColor:'#2563eb',borderRadius:10,padding:12,alignItems:'center',marginBottom:10}, btnT:{color:'#fff',fontWeight:'700'}, form:{backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:10,borderWidth:1,borderColor:'#e2e8f0'}, in:{borderWidth:1,borderColor:'#cbd5e1',borderRadius:8,padding:10,marginBottom:8}, card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#e2e8f0',alignItems:'center'}, ct:{fontWeight:'700',color:'#1e293b'}, cm:{fontSize:12,color:'#64748b'}, del:{color:'#dc2626',fontWeight:'700'}, empty:{textAlign:'center',color:'#64748b',marginTop:30} });
