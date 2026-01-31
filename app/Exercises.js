import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RED = "#dc143c";

const LoadingOverlay = () => {
  const pulseAnim = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.Text style={[styles.loadingTitle, { opacity: pulseAnim }]}>
        ⚡ LOADING EXERCISES ⚡
      </Animated.Text>
      <Text style={styles.loadingSubtext}>Summoning the database...</Text>
    </View>
  );
};

const Exercises = ({ onClose, onSelect }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        // Check cache first
        const cached = await AsyncStorage.getItem("exerciseDB");
        if (cached) {
          const parsed = JSON.parse(cached);
          setExercises(parsed);
          setFilteredExercises(parsed);
          setLoading(false);
          return;
        }

        // Fetch from API if no cache
        const response = await fetch(
          "https://exercisedb.p.rapidapi.com/exercises?limit=0&offset=0",
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": "af77d413eamsh0c2a0d3d9880799p182697jsnb18404139001",
              "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
          }
        );
        const data = await response.json();
        setExercises(data);
        setFilteredExercises(data);

        // Save to cache
        await AsyncStorage.setItem("exerciseDB", JSON.stringify(data));
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
      exercise.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredExercises(filtered);
  };

  if (loading) {
    return <LoadingOverlay />;
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
        placeholderTextColor="#888"
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
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 12,
  },
  loadingSubtext: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
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
    color: "#fff",
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
    color: "#fff",
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    color: RED,
  },
  secondary: {
    fontSize: 13,
    color: "#aaa",
  },
});

export default Exercises;