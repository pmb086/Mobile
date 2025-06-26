import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';

const WhiteboardScreen = () => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Whiteboard</Title>
      <Text style={styles.text}>Interactive whiteboard coming soon!</Text>
      <Button
        mode="contained"
        onPress={() => {
          // TODO: Implement whiteboard session creation
        }}
        style={styles.button}
      >
        Start New Session
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});

export default WhiteboardScreen; 