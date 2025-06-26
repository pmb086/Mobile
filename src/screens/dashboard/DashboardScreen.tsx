import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Welcome to TeachConnect</Title>
      
      <Card style={styles.card} onPress={() => navigation.navigate('Notes')}>
        <Card.Content>
          <Title>My Notes</Title>
          <Paragraph>Access and manage your study notes</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('Whiteboard')}>
        <Card.Content>
          <Title>Whiteboard</Title>
          <Paragraph>Interactive whiteboard sessions</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('Teachers')}>
        <Card.Content>
          <Title>Find Teachers</Title>
          <Paragraph>Connect with qualified teachers</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('Bookings')}>
        <Card.Content>
          <Title>My Bookings</Title>
          <Paragraph>View and manage your sessions</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('Inbox')}>
        <Card.Content>
          <Title>Messages</Title>
          <Paragraph>Check your conversations</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
});

export default DashboardScreen; 