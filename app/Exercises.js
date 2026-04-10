import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import exerciseDatabase, { searchExercises } from "../utils/exerciseDatabase";

const RED = "#dc143c";

const Exercises = ({ onClose, onSelect }) => {
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim().length >= 2) {
      const results = searchExercises(text.trim());
      setExercises(results);
    } else {
      setExercises([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setExercises([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerHint}>
          Search for exercises
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises (bench, chest, legs, etc)..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {exercises.length > 0 ? (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={styles.card}
            >
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>COMING{'\n'}SOON</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.secondary}>
                  {item.primaryMuscle.toUpperCase()} • {item.equipment}
                </Text>
                <Text style={styles.difficulty}>{item.difficulty}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {searchQuery.length > 0 && searchQuery.length < 2
              ? "Type at least 2 characters to search"
              : searchQuery.length >= 2
                ? "No exercises found"
                : "🔍 Search for exercises by name, muscle, or equipment\n\n500+ exercises available!"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  closeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    padding: 8,
  },
  headerHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    paddingRight: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  clearButtonText: {
    color: "#888",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "bold",
    textAlign: "center",
  },
  infoContainer: {
    flex: 1,
    flexShrink: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: RED,
    marginBottom: 2,
  },
  secondary: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 2,
  },
  difficulty: {
    fontSize: 11,
    color: "#888",
    textTransform: "capitalize",
  },
});

export default Exercises;