import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search',
  style,
}) => (
  <View style={[styles.wrap, style]}>
    <Ionicons name="search" size={18} color="#9CA3AF" style={styles.icon} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      style={styles.input}
      returnKeyType="search"
      clearButtonMode="while-editing"
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: 400,
    color: '#000000',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
});

export default SearchBar;
