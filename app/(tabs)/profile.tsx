import { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Collapsible } from "@/components/ui/collapsible";

// Mock data for recipes
const mockRecipes = [
  { id: "1", name: "Homemade Pasta", date: "2024-01-20", image: null },
  { id: "2", name: "Chocolate Cake", date: "2024-01-18", image: null },
  { id: "3", name: "Grilled Salmon", date: "2024-01-15", image: null },
  { id: "4", name: "Vegetable Stir Fry", date: "2024-01-12", image: null },
];

// Mock data for saved recipes
const mockSavedRecipes = [
  { id: "1", name: "Italian Risotto", date: "2024-01-22", image: null },
  { id: "2", name: "Beef Steak", date: "2024-01-21", image: null },
  { id: "3", name: "Caesar Salad", date: "2024-01-19", image: null },
];

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState("John Doe");
  const [isEditingName, setIsEditingName] = useState(false);
  const [bio, setBio] = useState("Food enthusiast and home chef. Love experimenting with new recipes!");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [gender, setGender] = useState("Prefer not to say");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert("Permission Required", "We need camera and media library permissions to select images.");
        return false;
      }
    }
    return true;
  };

  const pickImage = async (source: "camera" | "library") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose an option",
      [
        { text: "Camera", onPress: () => pickImage("camera") },
        { text: "Photo Library", onPress: () => pickImage("library") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleEditUsername = () => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Edit Username",
        "Enter your new username",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Save",
            onPress: (text) => {
              if (text && text.trim()) {
                setUserName(text.trim());
              }
            },
          },
        ],
        "plain-text",
        userName
      );
    } else {
      // For Android, use a simple alert with input simulation
      setIsEditingName(true);
    }
  };

  const saveUsername = (newName: string) => {
    if (newName && newName.trim()) {
      setUserName(newName.trim());
    }
    setIsEditingName(false);
  };

  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  const saveBio = (newBio: string) => {
    setBio(newBio.trim() || "");
    setIsEditingBio(false);
  };

  const handleEditGender = () => {
    Alert.alert(
      "Select Gender",
      "Choose your gender",
      [
        { text: "Male", onPress: () => setGender("Male") },
        { text: "Female", onPress: () => setGender("Female") },
        { text: "Prefer not to say", onPress: () => setGender("Prefer not to say") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Header */}
        <ThemedView style={styles.profileHeader}>
          <TouchableOpacity onPress={showImagePickerOptions} activeOpacity={0.7}>
            <ThemedView style={styles.avatarWrapper}>
              <ThemedView style={styles.avatarContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <IconSymbol name="person.fill" size={60} color={tintColor} />
                )}
              </ThemedView>
              <ThemedView
                style={[
                  styles.editIconContainer,
                  { backgroundColor: tintColor, borderColor: backgroundColor },
                ]}
              >
                <IconSymbol name="camera.fill" size={16} color="#fff" />
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
          <View style={styles.userNameContainer}>
            {isEditingName ? (
              <TextInput
                style={[styles.userNameInput, { color: textColor, borderColor: borderColor }]}
                value={userName}
                onChangeText={setUserName}
                onSubmitEditing={() => saveUsername(userName)}
                onBlur={() => saveUsername(userName)}
                autoFocus
                placeholder="Enter username"
                placeholderTextColor={iconColor}
              />
            ) : (
              <ThemedText type="title" style={styles.userName}>
                {userName}
              </ThemedText>
            )}
            {!isEditingName && (
              <TouchableOpacity onPress={handleEditUsername} style={styles.editNameButton}>
                <IconSymbol name="pencil.fill" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <ThemedText style={styles.userEmail}>
            john.doe@example.com
          </ThemedText>

          {/* Bio Section */}
          <View style={styles.bioContainer}>
            <ThemedText type="defaultSemiBold" style={styles.bioLabel}>
              Bio
            </ThemedText>
            {isEditingBio ? (
              <TextInput
                style={[styles.bioInput, { color: textColor, borderColor: borderColor }]}
                value={bio}
                onChangeText={setBio}
                onSubmitEditing={() => saveBio(bio)}
                onBlur={() => saveBio(bio)}
                autoFocus
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
                placeholderTextColor={iconColor}
              />
            ) : (
              <TouchableOpacity onPress={handleEditBio}>
                <ThemedText style={styles.bioText}>
                  {bio || "No bio yet. Tap to add one."}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Gender Section */}
          <View style={styles.genderContainer}>
            <ThemedText type="defaultSemiBold" style={styles.genderLabel}>
              Gender
            </ThemedText>
            <TouchableOpacity onPress={handleEditGender}>
              <ThemedText style={styles.genderText}>{gender}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Saved Recipes Section */}
        <ThemedView style={styles.section}>
          <Collapsible title="Saved Recipes">
            <ThemedView style={styles.recipesGrid}>
              {mockSavedRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <ThemedView style={styles.recipeImageContainer}>
                    {recipe.image ? (
                      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    ) : (
                      <IconSymbol name="book.fill" size={40} color={iconColor} />
                    )}
                  </ThemedView>
                  <ThemedText type="defaultSemiBold" style={styles.recipeName} numberOfLines={2}>
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>{recipe.date}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </Collapsible>
        </ThemedView>

        {/* Recipe History Section */}
        <ThemedView style={styles.section}>
          <Collapsible title="Recipe History">
            <ThemedView style={styles.recipesGrid}>
              {mockRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <ThemedView style={styles.recipeImageContainer}>
                    {recipe.image ? (
                      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    ) : (
                      <IconSymbol name="book.fill" size={40} color={iconColor} />
                    )}
                  </ThemedView>
                  <ThemedText type="defaultSemiBold" style={styles.recipeName} numberOfLines={2}>
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>{recipe.date}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </Collapsible>
        </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  userName: {
    textAlign: "center",
  },
  userNameInput: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 200,
  },
  editNameButton: {
    padding: 4,
  },
  userEmail: {
    opacity: 0.7,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  bioContainer: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  bioLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bioInput: {
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  genderContainer: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 14,
    opacity: 0.8,
  },
  editButton: {
    padding: 4,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  recipesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recipeCard: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 16,
  },
  recipeImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  recipeName: {
    marginBottom: 4,
    fontSize: 14,
  },
  recipeDate: {
    fontSize: 12,
    opacity: 0.7,
  },
});

