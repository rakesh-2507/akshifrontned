import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const LeaseDocsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lease Documents</Text>
      <Button title="Upload Document" onPress={() => {}} />
      <Text style={styles.note}>Uploaded documents will appear here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  note: { marginTop: 10, fontStyle: 'italic' },
});

export default LeaseDocsScreen;
