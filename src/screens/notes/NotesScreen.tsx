import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, Paragraph } from 'react-native-paper';

const NotesScreen = () => {
  const dummyNotes = [
    { id: '1', title: 'Math Notes', content: 'Algebra fundamentals...' },
    { id: '2', title: 'Science Notes', content: 'Physics concepts...' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.title}</Title>
              <Paragraph>{item.content}</Paragraph>
            </Card.Content>
          </Card>
        )}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          // TODO: Implement new note creation
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default NotesScreen; 