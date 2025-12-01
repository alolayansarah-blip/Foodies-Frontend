import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

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
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Notifications
          </ThemedText>
        </ThemedView>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mockNotifications.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="bell.fill" size={60} color={iconColor} />
              <ThemedText type="subtitle" style={styles.emptyText}>
                No notifications
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                You're all caught up!
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.notificationsList}>
              {mockNotifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    { borderBottomColor: borderColor },
                    index === mockNotifications.length - 1 && styles.lastItem,
                    !notification.read && styles.unreadItem,
                  ]}
                >
                  <ThemedView style={styles.notificationContent}>
                    <ThemedView style={styles.notificationHeader}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadTitle,
                        ]}
                      >
                        {notification.title}
                      </ThemedText>
                      {!notification.read && (
                        <ThemedView style={[styles.unreadDot, { backgroundColor: iconColor }]} />
                      )}
                    </ThemedView>
                    <ThemedText style={styles.notificationMessage}>
                      {notification.message}
                    </ThemedText>
                    <ThemedText style={styles.notificationTime}>
                      {notification.time}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTitle: {
    fontSize: 28,
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
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
  },
  notificationsList: {
    paddingHorizontal: 24,
  },
  notificationItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  unreadItem: {
    backgroundColor: "rgba(10, 126, 164, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
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
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
});

