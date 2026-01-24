import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserEXP } from "../src/redux/userSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import useAuth from "../hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db, storage } from "../config/firebase";

const RED = "#ff1a1a";

const Profile = () => {
  const { user, completedWorkouts } = useAuth();
  const dispatch = useDispatch();
  const { exp, level } = useSelector((state) => state.user);
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    height: "",
    weight: "",
  });

  const isFocused = useIsFocused();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    console.log("Logged out");
  };

  const openEditModal = () => {
    setEditData({
      username: userStats.username || "",
      height: userStats.height || "",
      weight: userStats.weight?.toString() || "",
    });
    setEditModalVisible(true);
  };

  const saveProfileUpdates = async () => {
    if (!editData.username || !editData.height || !editData.weight) {
      alert("All fields are required");
      return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: editData.username,
        height: editData.height,
        weight: parseInt(editData.weight) || 0,
      });
      await fetchUserStats(user.uid);
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEXP(user.uid));
      if (user.profilePic) {
        setProfilePic(user.profilePic);
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserStats(user.uid);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setProfilePic(selectedUri);
      await uploadImage(selectedUri);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) return;
    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filePath = `profilePictures/${user.uid}/profile.jpg`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setProfilePic(downloadURL);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { profilePic: downloadURL });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserStats(userSnap.data());
      } else {
        console.log("No user data found.");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isFocused) {
      dispatch(fetchUserEXP(currentUser.uid))
        .unwrap()
        .catch((err) => {
          console.error("❌ Failed to fetch EXP:", err);
        });

      fetchUserStats(currentUser.uid);
    }
  }, [currentUser, isFocused]);

  if (!user) {
    return (
      <LinearGradient
        colors={["#000", "#1a1a1a", "#000"]}
        style={styles.gradient}
      >
        <Text style={styles.emptyText}>No user logged in</Text>
      </LinearGradient>
    );
  }

  const expProgress = (exp || 0) % 1000;
  const progressWidth = `${(expProgress / 1000) * 100}%`;

  return (
    <LinearGradient
      colors={["#000", "#1a1a1a", "#000"]}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <SafeAreaView>
          <Text style={styles.title}>PROFILE</Text>

          {/* Profile Picture */}
          <View style={styles.user}>
            <TouchableOpacity onPress={pickImage}>
              {uploading ? (
                <ActivityIndicator size="large" color={RED} />
              ) : (
                <Image
                  source={
                    profilePic
                      ? { uri: profilePic }
                      : require("../assets/images/default-profile.jpg")
                  }
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {userStats.username || user.firstName || "User"}
              </Text>
              <Text style={styles.completedWorkoutsText}>
                {completedWorkouts} Workouts
              </Text>
            </View>
          </View>

          {/* EXP + Level */}

          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {level}</Text>
            <View style={styles.expBarContainer}>
              <View style={[styles.expBarFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.expText}>{exp || 0} / 1000 EXP</Text>
          </View>

          {/* Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>STATS</Text>
            <Text style={styles.statText}>
              Height: {userStats.height || "Not set"}
            </Text>
            <Text style={styles.statText}>
              Weight: {userStats.weight || "Not set"} lbs
            </Text>
            <Text style={styles.statText}>
              Best Bench: {userStats.bestBench || 0} lbs
            </Text>
            <Text style={styles.statText}>
              Best Squat: {userStats.bestSquat || 0} lbs
            </Text>
            <Text style={styles.statText}>
              Best Deadlift: {userStats.bestDeadlift || 0} lbs
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.neonButton} onPress={openEditModal}>
            <Text style={styles.neonButtonText}>EDIT PROFILE</Text>
          </TouchableOpacity>
          {/* 
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: "white" }}>Log Out</Text>
          </TouchableOpacity> */}

          {/* Edit Modal */}
          <Modal
            visible={editModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#888"
                  value={editData.username}
                  onChangeText={(text) =>
                    setEditData({ ...editData, username: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Height"
                  placeholderTextColor="#888"
                  value={editData.height}
                  onChangeText={(text) =>
                    setEditData({ ...editData, height: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Weight (lbs)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={editData.weight}
                  onChangeText={(text) =>
                    setEditData({ ...editData, weight: text })
                  }
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.neonButton, { flex: 1, width: "auto" }]}
                    onPress={saveProfileUpdates}
                  >
                    <Text style={styles.neonButtonText}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.neonButton,
                      {
                        flex: 1,
                        width: "auto",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderColor: "#888",
                      },
                    ]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={[styles.neonButtonText, { color: "#888" }]}>
                      CANCEL
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    marginVertical: 20,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: RED,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  userInfo: {
    marginLeft: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  completedWorkoutsText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  levelContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  levelText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  expBarContainer: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)", // grey background directly on container
    marginTop: 10,
  },

  expBarFill: {
    height: "100%",
    backgroundColor: "#ff1a1a",
    borderRadius: 6,
  },

  expText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: RED,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    color: RED,
    fontSize: 20,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: RED,
    textShadowRadius: 5,
  },
  statText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  neonButton: {
    width: "70%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },
  neonButtonText: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 16,
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: RED,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
});

export default Profile;
