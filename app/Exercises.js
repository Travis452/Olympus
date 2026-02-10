import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RED = "#dc143c";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MIN_FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes between API calls

const LoadingOverlay = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

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
      ]),
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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  // Check if cache is valid
  const isCacheValid = async (cacheKey) => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      const cacheTimestamp = await AsyncStorage.getItem(
        `${cacheKey}_timestamp`,
      );

      if (!cached || !cacheTimestamp) return null;

      const age = Date.now() - parseInt(cacheTimestamp);

      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error("Cache check error:", error);
      return null;
    }
  };

  // Search API with rate limiting protection
  const searchAPI = async (query) => {
    if (query.length < 2) {
      setExercises([]);
      return;
    }

    setSearching(true);

    try {
      // Check if we have a cached search result
      const searchCacheKey = `search_${query.toLowerCase().trim()}`;
      const cachedSearch = await isCacheValid(searchCacheKey);

      if (cachedSearch) {
        setExercises(cachedSearch);
        setSearching(false);
        return;
      }

      const response = await fetch(
        `https://exercisedb.dev/api/v1/exercises/search?q=${encodeURIComponent(query)}&limit=25`,
      );

      if (response.status === 429) {
        setRateLimited(true);
        setSearching(false);
        // Use cached search if available
        const cached = await AsyncStorage.getItem(searchCacheKey);
        if (cached) {
          setExercises(JSON.parse(cached));
        }
        return;
      }

      if (!response.ok) {
        console.log("Search failed:", response.status);
        setSearching(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const formattedExercises = result.data.map((ex) => ({
          id: ex.exerciseId,
          name: ex.name,
          gifUrl: ex.gifUrl,
          target: ex.targetMuscles?.[0] || "N/A",
          equipment: ex.equipments?.[0] || "bodyweight",
          instructions: ex.instructions || [],
        }));

        setExercises(formattedExercises);

        // Cache search results
        await AsyncStorage.setItem(
          searchCacheKey,
          JSON.stringify(formattedExercises),
        );
        await AsyncStorage.setItem(
          `${searchCacheKey}_timestamp`,
          Date.now().toString(),
        );

        setRateLimited(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 2) {
      searchAPI(searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setExercises([]);
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
        <Text style={styles.headerHint}>
          {rateLimited
            ? "⚠️ Rate limited - using cache"
            : "Search for exercises"}
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises (press Enter)..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmitEditing={handleSearchSubmit}
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

      {searching ? (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      ) : exercises.length > 0 ? (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={styles.card}
            >
              <Image source={{ uri: item.gifUrl }} style={styles.image} />
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.secondary}>Target: {item.target}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {searchQuery.length > 0 && searchQuery.length < 2
              ? "Type at least 2 characters and press Enter"
              : searchQuery.length >= 2
                ? "No exercises found"
                : "🔍 Search for exercises by name, muscle, or equipment"}
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
  searchingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchingText: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 10,
    fontSize: 14,
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
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#333",
  },
  infoContainer: {
    flex: 1,
    flexShrink: 1,
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
