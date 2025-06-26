import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/api.config';
import axios from 'axios';

// Types from Frontend
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

interface Subject {
  id: number;
  name: string;
  description: string;
}

interface TeacherSubject {
  id: number;
  teacherProfileId: number;
  subjectId: number;
  subject: Subject;
}

interface TeacherProfile {
  id: number;
  userId: number;
  user: User;
  title: string;
  description: string;
  hourlyRate: number;
  isAvailableOnline: boolean;
  isAvailableInPerson: boolean;
  teacherSubjects: TeacherSubject[];
}

const TeachersScreen = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const [filters, setFilters] = useState({
    subject: '',
    maxRate: '',
    isOnline: false
  });

  useEffect(() => {
    fetchTeachers();
  }, [filters]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, any> = {};
      if (filters.subject) params.subject = filters.subject;
      if (filters.maxRate) params.maxRate = parseFloat(filters.maxRate);
      if (filters.isOnline) params.isOnline = true;

      console.log('Attempting to fetch teachers from:', `${API_CONFIG.BASE_URL}/TeacherProfiles/Search`);
      const response = await api.get('/TeacherProfiles/Search', { params });
      console.log('Teachers fetched successfully:', response.data.length);
      setTeachers(response.data);
    } catch (error: unknown) {
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? (error as any).code : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'Failed to fetch teachers. Please try again later.';
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorMessage = `Network error. Unable to connect to ${API_CONFIG.BASE_URL}. Please check if the API is running and accessible.`;
        } else {
          errorMessage = `Server error ${error.response.status}: ${error.response.statusText}`;
        }
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTeacherCard = ({ item: teacher }: { item: TeacherProfile }) => (
    <TouchableOpacity 
      style={styles.teacherCard}
      onPress=
      {() => navigation.navigate('TeacherDetail', { teacherId: teacher.id })}
    >
      <View style={styles.teacherHeader}>
        <Image
          source={{ uri: teacher.user.profilePictureUrl || 'https://via.placeholder.com/150' }}
          style={styles.teacherImage}
        />
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>
            {teacher.user.firstName} {teacher.user.lastName}
          </Text>
          <Text style={styles.teacherTitle}>{teacher.title}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {teacher.description}
      </Text>

      <View style={styles.subjectsContainer}>
        {teacher.teacherSubjects.map((ts) => (
          <View key={ts.id} style={styles.subjectChip}>
            <Text style={styles.subjectText}>{ts.subject.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.rate}>${teacher.hourlyRate}/hour</Text>
        <View style={styles.availabilityContainer}>
          {teacher.isAvailableOnline && (
            <View style={styles.availabilityChip}>
              <Text style={styles.availabilityText}>Online</Text>
            </View>
          )}
          {teacher.isAvailableInPerson && (
            <View style={styles.availabilityChip}>
              <Text style={styles.availabilityText}>In-Person</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Teachers</Text>
      <Text style={styles.subtitle}>Connect with experienced educators in your area</Text>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.input}
          placeholder="Subject (e.g. Mathematics)"
          value={filters.subject}
          onChangeText={(text) => setFilters(prev => ({ ...prev, subject: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Max Rate Per Hour ($)"
          value={filters.maxRate}
          onChangeText={(text) => setFilters(prev => ({ ...prev, maxRate: text }))}
          keyboardType="numeric"
        />
        <View style={styles.switchContainer}>
          <Text>Online Sessions Only</Text>
          <Switch
            value={filters.isOnline}
            onValueChange={(value) => setFilters(prev => ({ ...prev, isOnline: value }))}
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={teachers}
        renderItem={renderTeacherCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.noResults}>
            <Text style={styles.noResultsTitle}>No teachers found</Text>
            <Text style={styles.noResultsText}>Try adjusting your filters or check back later.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  filtersContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teacherHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teacherInfo: {
    marginLeft: 12,
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  teacherTitle: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  subjectChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  availabilityContainer: {
    flexDirection: 'row',
  },
  availabilityChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#1976d2',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  noResults: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noResultsText: {
    color: '#666',
  },
});

export default TeachersScreen; 