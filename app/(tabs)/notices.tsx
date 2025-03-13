import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Calendar, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';

const NOTICES = [
  {
    id: '1',
    title: 'Annual General Meeting',
    description: 'Annual general meeting to discuss society matters and elect new committee members.',
    date: new Date('2024-02-15T18:00:00'),
    type: 'Meeting',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Water Supply Maintenance',
    description: 'Scheduled maintenance of water supply system. Please store water in advance.',
    date: new Date('2024-02-10T10:00:00'),
    type: 'Maintenance',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Cultural Event',
    description: 'Join us for a cultural evening with music and dance performances by society members.',
    date: new Date('2024-02-20T19:00:00'),
    type: 'Event',
    priority: 'low',
  },
];

export default function NoticesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notices & Updates</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ New Notice</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={NOTICES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.typeTag}>
                  <Bell size={14} color="#007AFF" />
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
                <ChevronRight size={20} color="#999" />
              </View>
              
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
              
              <View style={styles.dateContainer}>
                <Calendar size={16} color="#666" />
                <Text style={styles.dateText}>
                  {format(item.date, 'MMM d, yyyy • h:mm a')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#FF3B30';
    case 'medium':
      return '#FF9500';
    default:
      return '#34C759';
  }
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  priorityIndicator: {
    width: 4,
    backgroundColor: '#FF3B30',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  typeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#007AFF',
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#000',
  },
  cardDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
});