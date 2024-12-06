import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>About This App</Text>
      <Text style={styles.text}>
        The Personal Restaurant Guide helps you manage your favorite restaurants, rate them, and
        share details with your friends. Built with React Native.
      </Text>
      <Text style={styles.header}>Team</Text>
      <Text style={styles.text}>Ian McDonald, Sebastian Varon, Nikola Varicak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 24, marginBottom: 15 },
});
