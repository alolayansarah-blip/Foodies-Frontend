import { ProfileSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { Collapsible } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { getRecipes, Recipe } from "@/services/recipes";
import { uploadProfileImage } from "@/services/users";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "@/styles/profile";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  const { myRecipes } = useRecipes();
  const { user, logout } = useAuth();

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState(
    user?.name ||
      (user as any)?.username ||
      user?.email?.split("@")[0] ||
      "Guest"
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [bio, setBio] = useState(
    "Food enthusiast and home chef. Love experimenting with new recipes!"
  );
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [gender, setGender] = useState("Prefer not to say");
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [isLoadingUserRecipes, setIsLoadingUserRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const isLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();

  // Keep local profile name in sync with authenticated user
  useEffect(() => {
    if (user) {
      setUserName(
        user.name ||
          (user as any)?.username ||
          user.email?.split("@")[0] ||
          "Guest"
      );
    }
  }, [user]);

  // Fetch user's uploaded recipes
  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!user) {
        setUserRecipes([]);
        return;
      }

      try {
        setIsLoadingUserRecipes(true);
        const userId = user.id || (user as any)?._id;
        if (userId) {
          const recipes = await getRecipes({ user_id: userId });
          // Map recipes to match the expected format
          const mappedRecipes = recipes.map((recipe: Recipe) => ({
            ...recipe,
            id:
              recipe.id ||
              (recipe as any)?._id ||
              String(Date.now() + Math.random()),
            name: recipe.title || recipe.name,
            date:
              recipe.date ||
              recipe.createdAt ||
              new Date().toISOString().split("T")[0],
          }));
          setUserRecipes(mappedRecipes);
        } else {
          setUserRecipes([]);
        }
      } catch (error) {
        console.error("Error fetching user recipes:", error);
        setUserRecipes([]);
      } finally {
        setIsLoadingUserRecipes(false);
      }
    };

    fetchUserRecipes();
  }, [user]);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera and media library permissions to select images."
        );
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
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        // Upload image to backend as FormData
        if (user) {
          const userId = user.id || (user as any)?._id;
          if (userId) {
            try {
              await uploadProfileImage(userId, imageUri);
              Alert.alert("Success", "Profile image uploaded successfully!");
            } catch (uploadError) {
              console.error("Error uploading profile image:", uploadError);
              Alert.alert(
                "Error",
                "Failed to upload profile image. Please try again."
              );
            }
          }
        }
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
            onPress: (text: string | undefined) => {
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
        {
          text: "Prefer not to say",
          onPress: () => setGender("Prefer not to say"),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // Format date to DD/MM/YYYY HH:MM
  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return "01/01/1970 00:00";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return "01/01/1970 00:00";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: "#1a4d2e" }]}
        edges={["top", "bottom"]}
      >
        <ProfileSkeleton />
      </SafeAreaView>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={60}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                )}
              </View>
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.userNameContainer}>
            {isEditingName ? (
              <TextInput
                style={styles.userNameInput}
                value={userName}
                onChangeText={setUserName}
                onSubmitEditing={() => saveUsername(userName)}
                onBlur={() => saveUsername(userName)}
                autoFocus
                placeholder="Enter username"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            ) : (
              <ThemedText style={styles.userName}>{userName}</ThemedText>
            )}
            {!isEditingName && (
              <TouchableOpacity
                onPress={handleEditUsername}
                style={styles.editNameButton}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <ThemedText style={styles.userEmail}>
            {user?.email ?? "no-email@example.com"}
          </ThemedText>

          {/* Bio Section */}
          <View style={styles.bioContainer}>
            <ThemedText type="defaultSemiBold" style={styles.bioLabel}>
              Bio
            </ThemedText>
            {isEditingBio ? (
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                onSubmitEditing={() => saveBio(bio)}
                onBlur={() => saveBio(bio)}
                autoFocus
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
        </View>

        {/* My Recipes Section */}
        <View style={styles.section}>
          <Collapsible title="My Recipes">
            {isLoadingUserRecipes ? (
              <View style={styles.loadingContainer}>
                <ThemedText style={styles.loadingText}>
                  Loading recipes...
                </ThemedText>
              </View>
            ) : userRecipes.length === 0 ? (
              <View style={styles.emptyRecipesContainer}>
                <ThemedText style={styles.emptyRecipesText}>
                  No recipes uploaded yet. Create your first recipe!
                </ThemedText>
              </View>
            ) : (
              <View style={styles.recipesGrid}>
                {userRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => setSelectedRecipe(recipe)}
                  >
                    <View style={styles.recipeImageContainer}>
                      {getImageUrl(recipe.image) ? (
                        <Image
                          source={{ uri: getImageUrl(recipe.image)! }}
                          style={styles.recipeImage}
                          contentFit="cover"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="food"
                          size={40}
                          color="rgba(255, 255, 255, 0.7)"
                        />
                      )}
                    </View>
                    <ThemedText style={styles.recipeName} numberOfLines={2}>
                      {recipe.name || recipe.title}
                    </ThemedText>
                    <ThemedText style={styles.recipeDate}>
                      {recipe.date ||
                        recipe.createdAt?.split("T")[0] ||
                        "No date"}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Collapsible>
        </View>

        {/* Saved Recipes Section */}
        <View style={styles.section}>
          <Collapsible title="Saved Recipes">
            <View style={styles.recipesGrid}>
              {mockSavedRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeImageContainer}>
                    {getImageUrl(recipe.image) ? (
                      <Image
                        source={{ uri: getImageUrl(recipe.image)! }}
                        style={styles.recipeImage}
                        contentFit="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="food"
                        size={40}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    )}
                  </View>
                  <ThemedText style={styles.recipeName} numberOfLines={2}>
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>
                    {recipe.date}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
        </View>

        {/* Recipe History Section */}
        <View style={styles.section}>
          <Collapsible title="Recipe History">
            <View style={styles.recipesGrid}>
              {mockRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeImageContainer}>
                    {getImageUrl(recipe.image) ? (
                      <Image
                        source={{ uri: getImageUrl(recipe.image)! }}
                        style={styles.recipeImage}
                        contentFit="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="food"
                        size={40}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    )}
                  </View>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.recipeName}
                    numberOfLines={2}
                  >
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>
                    {recipe.date}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
        </View>
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent} edges={["top"]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Recipe Details
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setSelectedRecipe(null)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {selectedRecipe && (
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={[
                    styles.modalScrollContent,
                    { paddingTop: insets.top > 0 ? 0 : 16 },
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Recipe Image */}
                  {selectedRecipe.image ? (
                    <View style={styles.modalImageContainer}>
                      <Image
                        source={{ uri: selectedRecipe.image }}
                        style={styles.modalImage}
                        contentFit="cover"
                      />
                    </View>
                  ) : (
                    <View style={styles.modalImagePlaceholder}>
                      <MaterialCommunityIcons
                        name="food"
                        size={60}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    </View>
                  )}

                  {/* Recipe Title */}
                  <View style={styles.modalInfoContainer}>
                    <Text style={styles.modalRecipeTitle}>
                      {selectedRecipe?.name ||
                        selectedRecipe?.title ||
                        "Untitled Recipe"}
                    </Text>

                    {/* Recipe Date */}
                    <ThemedText style={styles.modalDate}>
                      {formatTime(
                        selectedRecipe?.createdAt || selectedRecipe?.date
                      )}
                    </ThemedText>

                    {/* Recipe Description */}
                    {selectedRecipe?.description ? (
                      <View style={styles.modalDescriptionWrapper}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={styles.modalDescriptionLabel}
                        >
                          Description
                        </ThemedText>
                        <ThemedText style={styles.modalDescription}>
                          {selectedRecipe.description}
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.modalNoDescription}>
                        No description available for this recipe.
                      </ThemedText>
                    )}
                  </View>
                </ScrollView>
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
