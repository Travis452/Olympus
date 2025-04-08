import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserEXP } from "../src/redux/userSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, storage } from "../config/firebase";

const Profile = () => {
  const { user, completedWorkouts } = useAuth();
  const dispatch = useDispatch();
  const { exp, level } = useSelector((state) => state.user);
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

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
        .then((data) => {
          console.log("✅ Updated EXP fetched:", data.exp);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch EXP:", err);
        });

      fetchUserStats(currentUser.uid); // keep this if you still want additional stats
    }
  }, [currentUser, isFocused]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user logged in</Text>
      </View>
    );
  }

  const expProgress = exp % 1000;
  const progressWidth = `${(expProgress / 1000) * 100}%`;

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView styles={styles.safeArea}>
        <View>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.user}>
          <TouchableOpacity onPress={pickImage}>
            {uploading ? (
              <ActivityIndicator size="large" color="#dc143c" />
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
            <Text style={styles.username}>{user.firstName || ""}</Text>
            <Text style={styles.completedWorkoutsText}>
              {completedWorkouts} Workouts
            </Text>
          </View>
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level: {level}</Text>
          <View style={styles.expBarContainer}>
            <View style={[styles.expBar, { width: progressWidth }]} />
          </View>
          <Text style={styles.expText}>{exp} / 1000 EXP</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.headerText}>Profile Stats</Text>
          <Text style={styles.statText}>Level: {userStats.level || 1}</Text>
          <Text style={styles.statText}>EXP: {userStats.exp || 0}</Text>
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
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    padding: 20,
    paddingTop: 0,
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderRadius: 50,
    marginTop: 20,
    backgroundColor: "lightgrey",
  },
  title: {
    textAlignVertical: "top",
    textAlign: "left",
    fontSize: 35,
    fontWeight: "700",
    margin: 15,
    marginTop: 40,
    marginLeft: 5,
  },
  safeArea: {
    flex: 0,
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "column",
  },
  username: {
    marginTop: 30,
    marginLeft: 15,
    fontSize: 20,
    fontWeight: "600",
  },
  completedWorkoutsText: {
    fontSize: 20,
    fontWeight: "300",
    marginLeft: 20,
  },
  levelContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  levelText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  expBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
  },
  expBar: {
    height: "100%",
    backgroundColor: "#dc143c",
  },
  expText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },

  //Stats Section

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default Profile;
