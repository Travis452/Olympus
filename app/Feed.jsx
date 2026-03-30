import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { collection, query, where, orderBy, getDocs, limit, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";
import { Heart, MessageCircle } from "lucide-react-native";
import { addComment, fetchComments } from "../utils/commentUtils";
import { notifyLike, notifyComment } from "../utils/notificationTriggers";
import BellIcon from "../components/BellIcon";

const RED = "#ff1a1a";

const Feed = ({ navigation }) => {
  const { user } = useAuth();
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const handleViewDetails = async (post) => {
    setSelectedWorkout(post);
    setDetailModalVisible(true);
    
    // Fetch comments for this post
    const result = await fetchComments(post.id);
    if (result.success) {
      setComments(result.comments);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedWorkout) return;
    
    setCommentLoading(true);
    const result = await addComment(selectedWorkout.id, user.uid, commentText.trim());
    
    if (result.success) {
      // Add comment to local state with ID
      setComments(prev => [...prev, { id: result.commentId, ...result.comment }]);
      
      // Update comment count in feed posts
      setFeedPosts(prev => prev.map(post => 
        post.id === selectedWorkout.id 
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));
      
      // Update selected workout comment count
      setSelectedWorkout(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));
      
      // Send notification to post owner (don't notify yourself)
      if (selectedWorkout.userId !== user.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const username = userData?.username || "Someone";
        const profilePic = userData?.profilePic || null;
        
        await notifyComment(
          selectedWorkout.userId,
          user.uid,
          username,
          profilePic,
          selectedWorkout.workoutName,
          commentText.trim()
        );
      }
      
      setCommentText("");
      Keyboard.dismiss();
    }
    
    setCommentLoading(false);
  };

  const handleLike = async (postId, currentLikes) => {
    if (!user) return;
    
    const isLiked = currentLikes.includes(user.uid);
    
    try {
      const postRef = doc(db, "feedPosts", postId);
      
      let updatedLikes;
      if (isLiked) {
        // Unlike
        updatedLikes = currentLikes.filter(id => id !== user.uid);
      } else {
        // Like
        updatedLikes = [...currentLikes, user.uid];
        
        // Send notification to post owner (don't notify yourself)
        const post = feedPosts.find(p => p.id === postId);
        if (post && post.userId !== user.uid) {
          // Get current user's data
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          const username = userData?.username || "Someone";
          const profilePic = userData?.profilePic || null;
          
          await notifyLike(post.userId, user.uid, username, profilePic, post.workoutName);
        }
      }
      
      await updateDoc(postRef, {
        likes: updatedLikes,
        likeCount: updatedLikes.length,
      });
      
      // Update local state
      setFeedPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: updatedLikes, likeCount: updatedLikes.length }
          : post
      ));
      
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
      // Get current user's following list
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setFeedPosts([]);
        setLoading(false);
        return;
      }
      
      const userData = userSnap.data();
      const following = userData.following || [];
      
      // Include yourself in the feed (so you see your own posts)
      const usersToShow = [...following, user.uid];
      
      // If not following anyone (and only see yourself), you might want empty state
      // But let's show your own posts
      
      // Fetch recent feed posts (no where clause, just orderBy)
      const feedQuery = query(
        collection(db, "feedPosts"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      
      const feedSnapshot = await getDocs(feedQuery);
      
      // Filter to only posts from followed users + yourself
      const posts = feedSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timeAgo: getTimeAgo(doc.data().timestamp?.toDate()),
        }))
        .filter(post => usersToShow.includes(post.userId));
      
      setFeedPosts(posts);
      
    } catch (error) {
      console.error("Error fetching feed:", error);
      setFeedPosts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const getTimeAgo = (date) => {
    if (!date) return "Just now";
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  return (
    <LinearGradient colors={["#000", "#1a1a1a", "#000"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <Text style={styles.title}>FEED</Text>
          <BellIcon />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RED} />
          }
        >
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading feed...</Text>
            </View>
          ) : feedPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Workouts Yet</Text>
              <Text style={styles.emptyText}>
                Follow other users to see their workouts here!
              </Text>
              <TouchableOpacity
                style={styles.leaderboardButton}
                onPress={() => navigation.navigate("Leaderboard")}
              >
                <Text style={styles.leaderboardButtonText}>Find People</Text>
              </TouchableOpacity>
            </View>
          ) : (
            feedPosts.map((post) => (
              <FeedPost 
                key={post.id} 
                post={post} 
                navigation={navigation}
                currentUserId={user?.uid}
                onLike={handleLike}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </ScrollView>

        {/* Workout Detail Modal */}
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setDetailModalVisible(false);
            setComments([]);
            setCommentText("");
          }}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.detailModalContent}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>
                    {selectedWorkout?.workoutName || "Workout"}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setDetailModalVisible(false);
                    setComments([]);
                    setCommentText("");
                  }}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.detailScroll}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Workout Info */}
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoText}>
                      {selectedWorkout?.expGained} EXP
                    </Text>
                    <Text style={styles.detailInfoText}>
                      {Math.floor((selectedWorkout?.duration || 0) / 60)} min
                    </Text>
                  </View>

                  {/* Exercises */}
                  <Text style={styles.detailSectionTitle}>EXERCISES</Text>
                  {selectedWorkout?.exercises && selectedWorkout.exercises.length > 0 ? (
                    selectedWorkout.exercises.map((exercise, index) => (
                      <View key={index} style={styles.exerciseCard}>
                        <Text style={styles.exerciseName}>{exercise.title}</Text>
                        {exercise.sets?.map((set, setIndex) => (
                          <Text key={setIndex} style={styles.setText}>
                            Set {setIndex + 1}: {set.lbs} lbs × {set.reps} reps
                          </Text>
                        ))}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.placeholderText}>
                      Exercise details not available for this workout.
                      {"\n"}Complete a new workout to see full details!
                    </Text>
                  )}

                  {/* Comments Section */}
                  <Text style={styles.detailSectionTitle}>COMMENTS</Text>
                  {comments.length === 0 ? (
                    <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                  ) : (
                    comments.map((comment, index) => (
                      <View key={comment.id || `comment-${index}`} style={styles.commentCard}>
                        <Image
                          source={
                            comment.profilePic
                              ? { uri: comment.profilePic }
                              : require("../assets/images/default-profile.jpg")
                          }
                          style={styles.commentProfilePic}
                        />
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUsername}>{comment.username}</Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Comment Input */}
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={handleAddComment}
                    disabled={!commentText.trim() || commentLoading}
                  >
                    <Text style={styles.sendButtonText}>
                      {commentLoading ? "..." : "SEND"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Feed Post Component
const FeedPost = ({ post, navigation, currentUserId, onLike, onViewDetails }) => {
  const isLiked = post.likes?.includes(currentUserId);
  
  return (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => onViewDetails(post)}
      activeOpacity={0.9}
    >
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.postUserInfo}
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate("UserProfile", { userId: post.userId });
          }}
        >
          <Image
            source={
              post.profilePic
                ? { uri: post.profilePic }
                : require("../assets/images/default-profile.jpg")
            }
            style={styles.postProfilePic}
          />
          <View>
            <Text style={styles.postUsername}>{post.username}</Text>
            <Text style={styles.postTime}>{post.timeAgo}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postWorkoutName}>{post.workoutName}</Text>
        <Text style={styles.postStats}>
          {post.exerciseCount} exercises • {post.expGained} EXP
        </Text>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={(e) => {
            e.stopPropagation();
            onLike(post.id, post.likes || []);
          }}
        >
          <Heart 
            color={RED} 
            size={20} 
            fill={isLiked ? RED : "transparent"}
          />
          <Text style={styles.likeCount}>{post.likeCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.commentButton}
          onPress={() => onViewDetails(post)}
        >
          <MessageCircle 
            color={RED} 
            size={20} 
          />
          <Text style={styles.commentCount}>{post.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Orbitron_700Bold",
    color: "#fff",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  leaderboardButton: {
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: RED,
  },
  leaderboardButtonText: {
    color: "#000",
    fontFamily: "Orbitron_700Bold",
    fontSize: 16,
    letterSpacing: 2,
  },
  postCard: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  postProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RED,
    marginRight: 10,
  },
  postUsername: {
    fontSize: 16,
    fontFamily: "Orbitron_700Bold",
    color: "#fff",
  },
  postTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  postContent: {
    marginBottom: 12,
  },
  postWorkoutName: {
    fontSize: 18,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    marginBottom: 6,
  },
  postStats: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
    gap: 20,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeCount: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Orbitron_700Bold",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentCount: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Orbitron_700Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  detailModalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: RED,
    borderBottomWidth: 0,
    maxHeight: "80%",
    paddingTop: 20,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  detailTitle: {
    fontSize: 20,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    flex: 1,
  },
  closeButton: {
    fontSize: 28,
    color: RED,
    fontWeight: "bold",
    padding: 5,
  },
  detailScroll: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  detailInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255,26,26,0.1)",
    borderRadius: 10,
  },
  detailInfoText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Orbitron_700Bold",
  },
  detailSectionTitle: {
    fontSize: 16,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    marginBottom: 10,
    letterSpacing: 2,
  },
  placeholderText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
  exerciseCard: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  setText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  noCommentsText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
  },
  commentCard: {
    flexDirection: "row",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  commentProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RED,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#1a1a1a",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#000",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#000",
    fontFamily: "Orbitron_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default Feed;