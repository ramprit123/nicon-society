import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Bell,
  Camera,
  ChevronRight,
  Globe,
  CircleHelp as HelpCircle,
  LogOut,
  Moon,
  Shield
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function SettingsScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      fetchProfile();
    };

    checkAuthAndFetch();
  }, []);

  const fetchProfile = async () => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          throw new Error('Profile not found');
        }
        throw profileError;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      if (error instanceof Error && (error.message.includes('JWT') || error.message === 'Not authenticated')) {
        router.replace('/login');
      }
    }
  };

  const handleImageUpload = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = {
          uri: result.assets[0].uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        };

        // Convert image to blob for web
        const formData = new FormData();
        formData.append('file', file as any);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const fileName = `${user.id}-${Date.now()}.jpg`;
        const filePath = `avatars/${fileName}`;

        let { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData);

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        await fetchProfile();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const sections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          type: 'switch',
          value: true,
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          type: 'switch',
          value: false,
        },
        {
          icon: Globe,
          label: 'Language',
          type: 'link',
          value: 'English',
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy Settings',
          type: 'link',
          value: 'Privacy',
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          type: 'link',
          value: 'Help',
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profile}>
        <TouchableOpacity onPress={handleImageUpload} disabled={loading}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              {loading ? (
                <Text style={styles.avatarText}>...</Text>
              ) : (
                <Camera size={24} color="#fff" />
              )}
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profile?.full_name || 'Loading...'}
          </Text>
          <Text style={styles.profileUnit}>
            {profile?.flat_number || 'No flat assigned'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                >
                  <View style={styles.settingItemLeft}>
                    <Icon size={20} color="#666" />
                    <Text style={styles.settingItemLabel}>{item.label}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={!!item.value}
                      onValueChange={() => {}}
                      trackColor={{ false: '#ddd', true: '#007AFF' }}
                    />
                  ) : (
                    <View style={styles.settingItemRight}>
                      {item.value && (
                        <Text style={styles.settingItemValue}>
                          {item.value}
                        </Text>
                      )}
                      <ChevronRight size={20} color="#999" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logout} onPress={handleLogout} >
        <LogOut size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logout: {
    display:"flex",
    flexDirection:"row",
    gap:3,
    alignItems:"center",
    justifyContent:"center",
    marginTop:20
  },
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
  },
  profile: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#000',
  },
  profileUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  editButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#007AFF',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#666',
    marginLeft: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#000',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FF3B30',
  },
  version: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
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