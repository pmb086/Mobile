import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

interface TeacherProfile {
  id: number;
  user: {
    firstName: string;
    lastName: string;
  };
  teacherSubjects: Array<{
    subjectId: number;
    subject: {
      id: number;
      name: string;
    };
    specificFocus?: string;
  }>;
  isAvailableOnline: boolean;
  isAvailableInPerson: boolean;
}

const BookingsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const teacherId = (route.params as any)?.teacherId;

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    subjectId: '',
    isOnline: true,
    location: '',
    notes: ''
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/teacherprofiles/${teacherId}`);
        setTeacher(response.data);
      } catch (err) {
        setError('Failed to load teacher details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const handleSubmit = async () => {
    if (!teacher || !user) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    if (!formData.subjectId || !formData.date || !formData.startTime || !formData.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Parse date and time
      const [year, month, day] = formData.date.split('-').map(Number);
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
      const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

      // Validate end time is after start time
      if (endDateTime <= startDateTime) {
        Alert.alert('Error', 'End time must be after start time');
        return;
      }

      // Validate date is not in the past
      if (startDateTime <= new Date()) {
        Alert.alert('Error', 'Booking date must be in the future');
        return;
      }

      const bookingData = {
        teacherProfileId: teacher.id,
        studentId: user.id,
        subjectId: parseInt(formData.subjectId),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        meetingLink: formData.isOnline ? 'Will be provided after confirmation' : undefined,
        location: !formData.isOnline ? formData.location : undefined,
        notes: formData.notes || undefined
      };

      await api.post('/bookings', bookingData);
      Alert.alert(
        'Success',
        'Booking request sent successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('MainApp') }]
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.title || 
                          'Failed to create booking. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (error || !teacher) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Teacher not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Book a Session with {teacher.user.firstName}</Text>

        {/* Subject Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject *</Text>
          <View style={styles.picker}>
            {teacher.teacherSubjects.map(ts => (
              <TouchableOpacity
                key={ts.subjectId}
                style={[
                  styles.subjectOption,
                  formData.subjectId === ts.subjectId.toString() && styles.subjectOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, subjectId: ts.subjectId.toString() }))}
              >
                <Text style={[
                  styles.subjectOptionText,
                  formData.subjectId === ts.subjectId.toString() && styles.subjectOptionTextSelected
                ]}>
                  {ts.subject.name} {ts.specificFocus ? `- ${ts.specificFocus}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
            placeholder="2024-12-25"
            keyboardType="numeric"
          />
        </View>

        {/* Time Selection */}
        <View style={styles.timeContainer}>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Start Time * (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={formData.startTime}
              onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
              placeholder="14:30"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.timeInput}>
            <Text style={styles.label}>End Time * (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={formData.endTime}
              onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: text }))}
              placeholder="15:30"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Session Type Selection */}
        {teacher.isAvailableOnline && teacher.isAvailableInPerson && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Session Type</Text>
            <View style={styles.switchContainer}>
              <Text>In-Person</Text>
              <Switch
                value={formData.isOnline}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isOnline: value }))}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={formData.isOnline ? '#1976d2' : '#f4f3f4'}
              />
              <Text>Online</Text>
            </View>
          </View>
        )}

        {/* Location Input */}
        {!formData.isOnline && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Enter meeting location"
            />
          </View>
        )}

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Any specific requirements or topics you'd like to cover?"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Request Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  subjectOptionSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  subjectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  subjectOptionTextSelected: {
    color: '#1976d2',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingsScreen; 