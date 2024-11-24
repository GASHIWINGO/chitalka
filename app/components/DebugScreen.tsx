import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DebugScreen = () => {
  const [dbContent, setDbContent] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const loadDB = async () => {
    try {
      const books = await AsyncStorage.getItem('books_storage');
      setDbContent(JSON.stringify(JSON.parse(books || '[]'), null, 2));
    } catch (error) {
      console.error('Error loading DB:', error);
      setDbContent('Error loading database');
    }
  };

  const clearDB = async () => {
    try {
      await AsyncStorage.clear();
      setDbContent('Database cleared');
      alert('Database cleared');
    } catch (error) {
      console.error('Error clearing DB:', error);
      alert('Error clearing database');
    }
  };

  // Обновляем содержимое каждый раз при открытии
  useEffect(() => {
    if (isVisible) {
      loadDB();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.debugButtonText}>🔍</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setIsVisible(false)}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadDB}
        >
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearDB}
        >
          <Text style={styles.buttonText}>Clear DB</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.codeText}>{dbContent}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#333',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  button: {
    padding: 8,
    backgroundColor: '#666',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#a33',
  },
  buttonText: {
    color: 'white',
  },
  codeText: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  debugButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  debugButtonText: {
    fontSize: 20,
  },
});

export default DebugScreen; 