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
import { useSelector, useDispatch } from "react-redux";
import { fetchUserEXP } from "../src/redux/userSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase";

const Profile = () => {
  const { user, completedWorkouts } = useAuth();
  const dispatch = useDispatch();
  const { exp, level } = useSelector((state) => state.user);
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEXP(user.uid));
      if (user.profilePic) {
        setProfilePic(user.profilePic);
      }
    }
  }, [user, dispatch]);

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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user logged in</Text>
      </View>
    );
  }

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
            <View style={[styles.expBar, { width: `${(exp % 1000) / 10}%` }]} />
          </View>
          <Text style={styles.expText}>{exp} / 1000 EXP</Text>
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
});

export default Profile;
