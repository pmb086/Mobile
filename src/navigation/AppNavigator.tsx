import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotesScreen from '../screens/notes/NotesScreen';
import WhiteboardScreen from '../screens/whiteboard/WhiteboardScreen';
import TeachersScreen from '../screens/teachers/TeachersScreen';
import TeacherDetailScreen from '../screens/teachers/TeacherDetailScreen';
import InboxScreen from '../screens/inbox/InboxScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Notes':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Whiteboard':
              iconName = focused ? 'easel' : 'easel-outline';
              break;
            case 'Teachers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Inbox':
              iconName = focused ? 'mail' : 'mail-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'alert';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Whiteboard" component={WhiteboardScreen} />
      <Tab.Screen name="Teachers" component={TeachersScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1976d2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TeacherDetail"
          component={TeacherDetailScreen}
          options={{ title: 'Teacher Profile' }}
        />
        <Stack.Screen
          name="BookingForm"
          component={BookingsScreen}
          options={{ title: 'Book a Session' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 