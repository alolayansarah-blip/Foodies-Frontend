import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "@/services/notifications";
import { getUserById } from "@/services/users";
import { styles } from "@/styles/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const isLoading = useNavigationLoading();
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationUsers, setNotificationUsers] = useState<
    Record<string, any>
  >({});

  const fetchNotifications = async () => {
    if (!user) {
      setIsLoadingNotifications(false);
      return;
    }

    try {
      setIsLoadingNotifications(true);
      const userId = user._id || (user as any)?.id;
      if (userId) {
        const fetchedNotifications = await getNotifications({
          user_id: userId,
        });
        // Sort by creation date, newest first
        const sorted = fetchedNotifications.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setNotifications(sorted);

        // Fetch user info for like/dislike notifications
        const usersMap: Record<string, any> = {};
        await Promise.all(
          sorted
            .filter((n) => n.type === "like" || n.type === "dislike")
            .map(async (notification) => {
              // Try to get user ID from notification data
              const notificationUserId =
                (notification as any).liked_by ||
                (notification as any).disliked_by ||
                (notification as any).from_user_id ||
                (notification as any).fromUser?._id;

              if (notificationUserId && notificationUserId !== userId) {
                try {
                  const userData = await getUserById(notificationUserId);
                  usersMap[notification.id || notification._id || ""] =
                    userData;
                } catch (error) {
                  console.error(
                    `Error fetching user ${notificationUserId}:`,
                    error
                  );
                }
              }
            })
        );
        setNotificationUsers(usersMap);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [user])
  );

  const handleNotificationPress = async (notification: Notification) => {
    const notificationId = notification.id || notification._id;
    if (notificationId && !notification.read) {
      try {
        await markNotificationAsRead(notificationId);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            (n.id || n._id) === notificationId ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to recipe if it's a rating notification
    if (notification.type === "rating" && notification.recipe_id) {
      // You can add navigation here if needed
      // router.push(`/recipe/${notification.recipe_id}`);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minute${
          Math.floor(diffInSeconds / 60) !== 1 ? "s" : ""
        } ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hour${
          Math.floor(diffInSeconds / 3600) !== 1 ? "s" : ""
        } ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} day${
          Math.floor(diffInSeconds / 86400) !== 1 ? "s" : ""
        } ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

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
      style={[styles.container, { backgroundColor: "#0d2818" }]}
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
          {isLoadingNotifications ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <ThemedText style={styles.emptyText}>
                Loading notifications...
              </ThemedText>
            </View>
          ) : notifications.length === 0 ? (
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
              {notifications.map((notification) => {
                const notificationId = notification.id || notification._id;
                const isRead = notification.read || false;
                const notificationUser =
                  notificationUsers[notificationId || ""];
                const userName =
                  notificationUser?.userName ||
                  notificationUser?.name ||
                  notificationUser?.username ||
                  "Someone";

                // Get icon based on notification type
                const getNotificationIcon = () => {
                  switch (notification.type) {
                    case "like":
                      return "thumbs-up";
                    case "dislike":
                      return "thumbs-down";
                    case "rating":
                      return "star";
                    case "comment":
                      return "chatbubble";
                    default:
                      return "notifications";
                  }
                };

                return (
                  <TouchableOpacity
                    key={notificationId || `notification-${Math.random()}`}
                    style={[
                      styles.notificationItem,
                      !isRead && styles.unreadItem,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationIconContainer}>
                      <Ionicons
                        name={getNotificationIcon() as any}
                        size={24}
                        color={
                          notification.type === "like"
                            ? "#4CAF50"
                            : notification.type === "dislike"
                            ? "#ff4444"
                            : notification.type === "rating"
                            ? "#ffa500"
                            : "rgba(255, 255, 255, 0.8)"
                        }
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <ThemedText
                          style={[
                            styles.notificationTitle,
                            !isRead && styles.unreadTitle,
                          ]}
                        >
                          {notification.title}
                        </ThemedText>
                        {!isRead && <View style={styles.unreadDot} />}
                      </View>
                      <ThemedText style={styles.notificationMessage}>
                        {notification.type === "like" ||
                        notification.type === "dislike"
                          ? `${userName} ${
                              notification.type === "like"
                                ? "liked"
                                : "disliked"
                            } your recipe "${notification.message || ""}"`
                          : notification.message}
                      </ThemedText>
                      <ThemedText style={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
