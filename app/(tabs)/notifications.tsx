import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "@/styles/notifications";
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
