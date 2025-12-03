import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "recipe",
    title: "New Recipe Available",
    message: "Check out the new Homemade Pasta recipe!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "like",
    title: "Someone liked your recipe",
    message: "Your Chocolate Cake recipe received a like",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "comment",
    title: "New comment on your recipe",
    message: "Great recipe! Thanks for sharing.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "recipe",
    title: "Recipe suggestion",
    message: "You might like this Grilled Salmon recipe",
    time: "2 days ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const isLoading = useNavigationLoading();
  const { logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageSkeleton />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#1a4d2e" }]}
      edges={["top", "bottom"]}
    >
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Image
            source={require("@/assets/images/logo2.png")}
            style={styles.headerLogo}
            contentFit="contain"
          />
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingTop: 10 }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mockNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-outline"
                size={60}
                color="rgba(255, 255, 255, 0.6)"
              />
              <ThemedText style={styles.emptyText}>No notifications</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                You're all caught up!
              </ThemedText>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {mockNotifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadItem,
                  ]}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <ThemedText
                        style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadTitle,
                        ]}
                      >
                        {notification.title}
                      </ThemedText>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <ThemedText style={styles.notificationMessage}>
                      {notification.message}
                    </ThemedText>
                    <ThemedText style={styles.notificationTime}>
                      {notification.time}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a4d2e", // Dark forest green
    position: "relative",
  },
  backgroundElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    top: -50,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    bottom: 100,
    left: -30,
  },
  circle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    top: "40%",
    right: 20,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 200,
    height: 100,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    backgroundColor: "transparent",
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  notificationsList: {
    paddingHorizontal: 24,
  },
  notificationItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  unreadItem: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
    color: "#fff",
    fontWeight: "500",
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: "#fff",
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
    color: "rgba(255, 255, 255, 0.9)",
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
