import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { Wrench, Clock, CircleCheck, CircleAlert, Search, Filter, Plus, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';
type MaintenancePriority = 'low' | 'medium' | 'high';

interface FilterState {
  status: MaintenanceStatus | 'all';
  priority: MaintenancePriority | 'all';
  search: string;
  dateFrom: string;
  dateTo: string;
}

export default function MaintenanceScreen() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  });
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
  });

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium' as MaintenancePriority,
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      fetchRequests();
      fetchStats();
    };

    checkAuthAndFetch();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      let query = supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch maintenance requests');
      if (error instanceof Error && error.message.includes('JWT')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data, error: statsError } = await supabase
        .from('maintenance_requests')
        .select('status')
        .in('status', ['pending', 'in_progress', 'completed']);

      if (statsError) throw statsError;

      const newStats = {
        pending: 0,
        in_progress: 0,
        completed: 0,
      };

      data?.forEach((request) => {
        newStats[request.status as keyof typeof newStats]++;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch maintenance stats');
      if (error instanceof Error && error.message.includes('JWT')) {
        router.replace('/login');
      }
    }
  };

  const handleCreateRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('maintenance_requests')
        .insert([
          {
            ...newRequest,
            status: 'pending',
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      setShowNewRequest(false);
      setNewRequest({
        title: '',
        description: '',
        location: '',
        priority: 'medium',
      });
      fetchRequests();
      fetchStats();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const getStatusInfo = (status: MaintenanceStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: CircleCheck,
          color: '#34C759',
          text: 'Completed',
        };
      case 'in_progress':
        return {
          icon: Clock,
          color: '#FF9500',
          text: 'In Progress',
        };
      default:
        return {
          icon: CircleAlert,
          color: '#FF3B30',
          text: 'Pending',
        };
    }
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Requests</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      filters.status === status && styles.filterOptionSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, status: status as any })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.status === status && styles.filterOptionTextSelected,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Priority</Text>
              <View style={styles.filterOptions}>
                {['all', 'low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterOption,
                      filters.priority === priority && styles.filterOptionSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, priority: priority as any })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.priority === priority && styles.filterOptionTextSelected,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateInputs}>
                <TextInput
                  style={styles.dateInput}
                  placeholder="From (YYYY-MM-DD)"
                  value={filters.dateFrom}
                  onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                />
                <TextInput
                  style={styles.dateInput}
                  placeholder="To (YYYY-MM-DD)"
                  value={filters.dateTo}
                  onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setFilters({
                  status: 'all',
                  priority: 'all',
                  search: '',
                  dateFrom: '',
                  dateTo: '',
                });
                setShowFilters(false);
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderNewRequestModal = () => (
    <Modal
      visible={showNewRequest}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNewRequest(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Maintenance Request</Text>
            <TouchableOpacity onPress={() => setShowNewRequest(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={newRequest.title}
                onChangeText={(text) => setNewRequest({ ...newRequest, title: text })}
                placeholder="Enter request title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location</Text>
              <TextInput
                style={styles.formInput}
                value={newRequest.location}
                onChangeText={(text) => setNewRequest({ ...newRequest, location: text })}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newRequest.description}
                onChangeText={(text) => setNewRequest({ ...newRequest, description: text })}
                placeholder="Enter detailed description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.filterOptions}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterOption,
                      newRequest.priority === priority && styles.filterOptionSelected,
                    ]}
                    onPress={() => setNewRequest({ ...newRequest, priority: priority as MaintenancePriority })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        newRequest.priority === priority && styles.filterOptionTextSelected,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowNewRequest(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateRequest}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewRequest(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>New Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FF3B30' }]}>
            <CircleAlert size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FF9500' }]}>
            <Clock size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.in_progress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#34C759' }]}>
            <CircleCheck size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchRequests}
        renderItem={({ item }) => {
          const statusInfo = getStatusInfo(item.status);
          const StatusIcon = statusInfo.icon;

          return (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Wrench size={20} color="#007AFF" />
                  <Text style={styles.cardTitleText}>{item.title}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: `${statusInfo.color}15` }]}>
                  <StatusIcon size={14} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.location}>{item.location}</Text>
              <Text style={styles.description}>{item.description}</Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <TouchableOpacity style={styles.detailsButton}>
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {renderFiltersModal()}
      {renderNewRequestModal()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#000',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#000',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  location: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#000',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  filterOptionSelected: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#000',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  dateInputs: {
    gap: 12,
  },
  dateInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Inter_400Regular',
  },
  resetButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  resetButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 2,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  applyButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Inter_400Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 2,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  submitButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FF3B30',
  },
});