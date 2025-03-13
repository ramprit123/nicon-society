import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, UserCheck, Car, Bell, FileText, CreditCard } from 'lucide-react-native';

export default function HomeScreen() {
  const quickActions = [
    { icon: Shield, label: 'Visitor Pass', color: '#007AFF' },
    { icon: UserCheck, label: 'Staff Entry', color: '#34C759' },
    { icon: Car, label: 'Vehicle Pass', color: '#FF9500' },
    { icon: Bell, label: 'Announcements', color: '#FF3B30' },
    { icon: FileText, label: 'Maintenance', color: '#5856D6' },
    { icon: CreditCard, label: 'Pay Dues', color: '#FF2D55' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.name}>John Doe</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem}>
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <action.icon size={24} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notices</Text>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Monthly Meeting</Text>
          <Text style={styles.noticeDate}>Tomorrow at 7 PM</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance Requests</Text>
        <View style={styles.maintenanceCard}>
          <Text style={styles.maintenanceTitle}>Plumbing Issue</Text>
          <Text style={styles.maintenanceStatus}>In Progress</Text>
        </View>
      </View>
    </ScrollView>
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
  },
  welcome: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#000',
    marginTop: 4,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  noticeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noticeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#000',
  },
  noticeDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  maintenanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenanceTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#000',
  },
  maintenanceStatus: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#34C759',
  },
});