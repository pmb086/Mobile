import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/api.config';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  subjectTaught: string;
  lessonDate: string;
  studentId: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface TeacherProfile {
  id: number;
  title: string;
  description: string;
  expertise: string;
  education?: string;
  certifications?: string;
  hourlyRate: number;
  yearsOfExperience: number;
  isAvailableOnline: boolean;
  isAvailableInPerson: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
  };
}

const TeacherDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, token, isAuthenticated } = useAuth();
  const teacherId = (route.params as any)?.id;

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching teacher data for ID:', teacherId);
        console.log('API Base URL:', API_CONFIG.BASE_URL);
        console.log('Authentication status:', { isAuthenticated, hasToken: !!token, userId: user?.id });
        
        // Test API connection first
        try {
          const testResponse = await api.get('/test');
          console.log('API connection test successful:', testResponse.data);
        } catch (testErr: any) {
          console.log('API connection test failed:', testErr.message);
          // Continue anyway, as the test endpoint might not exist
        }
        
        // Fetch teacher profile first (this doesn't require authentication)
        const teacherRes = await api.get(`/teacherprofiles/${teacherId}`);
        console.log('Teacher data received:', teacherRes.data);
        setTeacher(teacherRes.data);
        
        // Try to fetch reviews (this requires authentication)
        if (isAuthenticated && token) {
          try {
            const reviewsRes = await api.get(`/reviews/teacher/${teacherId}`);
            console.log('Reviews data received:', reviewsRes.data);
            setReviews(reviewsRes.data);
          } catch (reviewsErr: any) {
            console.log('Failed to fetch reviews:', reviewsErr.message);
            console.log('Reviews error details:', {
              status: reviewsErr.response?.status,
              data: reviewsErr.response?.data,
              headers: reviewsErr.response?.headers
            });
            // If reviews fail, just show empty reviews
            setReviews([]);
          }
        } else {
          console.log('User not authenticated, skipping reviews fetch');
          setReviews([]);
        }
        
      } catch (err: any) {
        console.error('Error fetching teacher data:', err);
        
        let errorMessage = 'Failed to load teacher profile';
        
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          errorMessage = 'Cannot connect to server. Please check your internet connection and ensure the backend server is running.';
        } else if (err.response) {
          // Server responded with error status
          if (err.response.status === 404) {
            errorMessage = 'Teacher profile not found';
          } else if (err.response.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (err.response.status === 400) {
            errorMessage = `Bad request: ${err.response.data?.message || err.response.statusText}`;
          } else if (err.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
          }
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          // Something else happened
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherAndReviews();
    } else {
      setError('No teacher ID provided');
      setLoading(false);
    }
  }, [teacherId, isAuthenticated, token]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // This will trigger the useEffect again
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBookSession = () => {
    navigation.navigate('BookingForm', { teacherId: teacher.id });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Teacher Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.header}>
          <Image
            source={{ uri: teacher.user.profilePictureUrl || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{teacher.user.firstName} {teacher.user.lastName}</Text>
            <Text style={styles.title}>{teacher.title}</Text>
            <View style={styles.stats}>
              <Text style={styles.statText}>⭐ {averageRating.toFixed(1)} ({reviews.length})</Text>
              <Text style={styles.statText}>💼 {teacher.yearsOfExperience} years</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>{teacher.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expertise</Text>
          <Text style={styles.sectionText}>{teacher.expertise}</Text>
        </View>

        {teacher.education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <Text style={styles.sectionText}>{teacher.education}</Text>
          </View>
        )}

        {teacher.certifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text style={styles.sectionText}>{teacher.certifications}</Text>
          </View>
        )}

        {/* Booking Section */}
        <View style={styles.bookingSection}>
          <Text style={styles.rateText}>Rate: ${teacher.hourlyRate}/hour</Text>
          
          <View style={styles.teachingMethods}>
            <Text style={styles.sectionTitle}>Available Teaching Methods</Text>
            {teacher.isAvailableOnline && (
              <Text style={styles.methodText}>🎥 Online Sessions</Text>
            )}
            {teacher.isAvailableInPerson && (
              <Text style={styles.methodText}>👤 In-Person Sessions</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookSession}
          >
            <Text style={styles.bookButtonText}>Schedule Session</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          ) : (
            reviews.map(review => (
              <View key={review.id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>
                    {review.student.firstName} {review.student.lastName}
                  </Text>
                  <Text style={styles.rating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                <Text style={styles.reviewSubject}>{review.subjectTaught}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>
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
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  bookingSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  rateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  teachingMethods: {
    marginBottom: 15,
  },
  methodText: {
    fontSize: 16,
    marginBottom: 6,
  },
  bookButton: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  review: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 16,
  },
  reviewSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TeacherDetailScreen; 