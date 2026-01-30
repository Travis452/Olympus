import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { RAPIDAPI_KEY } from "@env"; // make sure this is working

const Exercises = ({ onClose, onSelect }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const options = {
        method: "GET",
        url: "https://exercisedb.p.rapidapi.com/exercises?limit=0&offset=0",
        headers: {
          "X-RapidAPI-Key":
            "af77d413eamsh0c2a0d3d9880799p182697jsnb18404139001",
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        setExercises(response.data);
        setFilteredExercises(response.data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredExercises(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc143c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)} style={styles.card}>
            <Image source={{ uri: item.gifUrl }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.secondary}>Target: {item.target}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    overflow: "hidden", // keeps content inside the rounded corners
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a", // slightly lighter grey for cards
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  header: {
    alignItems: "flex-start",
    marginBottom: 10,
  },

  closeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // white X button
    padding: 8,
    marginTop: 5,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },

  infoContainer: {
    flex: 1,
    flexShrink: 1,
  },

  searchInput: {
    color: "#fff", // white text when typing
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    placeholderTextColor: "#888", // note: this won't work here, see below
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#333",
  },

  textContainer: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    color: "#dc143c", // crimson red to match your theme
  },

  secondary: {
    fontSize: 13,
    color: "#aaa", // light grey for target muscle
  },
});

export default Exercises;
