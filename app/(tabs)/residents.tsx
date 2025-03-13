import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Phone, Mail, Building } from 'lucide-react-native';

const RESIDENTS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    flat: 'A-101',
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@example.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: '2',
    name: 'Michael Chen',
    flat: 'B-205',
    phone: '+1 (555) 234-5678',
    email: 'michael.c@example.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    flat: 'C-304',
    phone: '+1 (555) 345-6789',
    email: 'emily.r@example.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
];

export default function ResidentsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Residents Directory</Text>
        <TouchableOpacity style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search residents...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={RESIDENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.details}>
                <Building size={16} color="#666" />
                <Text style={styles.detailText}>{item.flat}</Text>
              </View>
              <View style={styles.details}>
                <Phone size={16} color="#666" />
                <Text style={styles.detailText}>{item.phone}</Text>
              </View>
              <View style={styles.details}>
                <Mail size={16} color="#666" />
                <Text style={styles.detailText}>{item.email}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    color: '#666',
    fontSize: 16,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
});