import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  ImageBackground,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRecipes } from "@/contexts/RecipesContext";

// Mock categories - replace with actual API call to fetch categories
const categories = [
  { id: "60d5ec49f1b2c72b8c8e4f1b", name: "Italian" },
  { id: "60d5ec49f1b2c72b8c8e4f2c", name: "Dessert" },
  { id: "60d5ec49f1b2c72b8c8e4f3d", name: "Seafood" },
  { id: "60d5ec49f1b2c72b8c8e4f4e", name: "Vegetarian" },
  { id: "60d5ec49f1b2c72b8c8e4f5f", name: "Meat" },
  { id: "60d5ec49f1b2c72b8c8e4f6a", name: "Salad" },
];

// Replace with your actual API base URL
const API_BASE_URL = "http://134.122.96.197:3000";

export default function CameraScreen() {
  const { addRecipe } = useRecipes();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    user_id: "60d5ec49f1b2c72b8c8e4f1a", // TODO: Get from auth context
    category_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = "#83ab64";

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera and media library permissions to take and select photos."
        );
        return false;
      }
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentImageUri(result.assets[0].uri);
        setShowForm(true);
        // Reset form
        setFormData({
          title: "",
          description: "",
          user_id: "60d5ec49f1b2c72b8c8e4f1a",
          category_id: "",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  const pickFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentImageUri(result.assets[0].uri);
        setShowForm(true);
        // Reset form
        setFormData({
          title: "",
          description: "",
          user_id: "60d5ec49f1b2c72b8c8e4f1a",
          category_id: "",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a recipe title.");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description.");
      return;
    }
    if (!formData.category_id) {
      Alert.alert("Error", "Please select a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recipeData = {
        title: formData.title,
        description: formData.description,
        user_id: formData.user_id,
        category_id: formData.category_id,
      };

      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      const data = await response.json();

      if (response.ok) {
        // Add recipe to My Recipes
        const newRecipe = {
          id: data.id || Date.now().toString(),
          name: formData.title,
          date: new Date().toISOString().split("T")[0],
          image: currentImageUri,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
        };
        addRecipe(newRecipe);

        Alert.alert("Success", "Recipe posted successfully!", [
          {
            text: "OK",
            onPress: () => {
              setShowForm(false);
              setCurrentImageUri(null);
              if (currentImageUri) {
                setSelectedImages([...selectedImages, currentImageUri]);
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to post recipe.");
      }
    } catch (error) {
      // Even if API fails, add to local recipes for demo purposes
      const newRecipe = {
        id: Date.now().toString(),
        name: formData.title,
        date: new Date().toISOString().split("T")[0],
        image: currentImageUri,
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
      };
      addRecipe(newRecipe);

      Alert.alert("Success", "Recipe added to My Recipes!", [
        {
          text: "OK",
          onPress: () => {
            setShowForm(false);
            setCurrentImageUri(null);
            if (currentImageUri) {
              setSelectedImages([...selectedImages, currentImageUri]);
            }
          },
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setCurrentImageUri(null);
  };

  const showImageOptions = () => {
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePicture },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              Camera
            </ThemedText>
          </ThemedView>

          {/* Camera Button */}
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: tintColor }]}
              onPress={showImageOptions}
            >
              <IconSymbol name="camera.fill" size={40} color="#fff" />
              <ThemedText style={styles.cameraButtonText}>
                {selectedImages.length === 0
                  ? "Take or Select Photo"
                  : "Add More Photos"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Selected Images Grid */}
          {selectedImages.length > 0 && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText type="defaultSemiBold" style={styles.imagesHeader}>
                Your Photos ({selectedImages.length})
              </ThemedText>
              <View style={styles.imagesGrid}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <IconSymbol name="xmark.circle.fill" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Empty State */}
          {selectedImages.length === 0 && (
            <View style={styles.emptyContainer}>
              <IconSymbol name="camera.fill" size={80} color={iconColor} />
              <ThemedText type="subtitle" style={styles.emptyText}>
                No photos yet
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Tap the button above to take or select photos of your dishes
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </SafeAreaView>

      {/* Recipe Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeForm}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ImageBackground
            source={require("@/assets/images/background.png")}
            style={styles.modalBackground}
            resizeMode="cover"
          >
            <View style={styles.modalOverlay} />
            <SafeAreaView style={styles.modalContent} edges={["top"]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeForm}>
                  <ThemedText style={[styles.cancelButton, { color: tintColor }]}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText type="title" style={styles.modalTitle}>
                  New Recipe
                </ThemedText>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={[
                    styles.submitButton,
                    { backgroundColor: tintColor },
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                >
                  <ThemedText style={styles.submitButtonText}>
                    {isSubmitting ? "Posting..." : "Post"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScrollView}
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Image Preview */}
                {currentImageUri && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: currentImageUri }} style={styles.imagePreview} contentFit="cover" />
                  </View>
                )}

                {/* Title Input */}
                <View style={styles.inputContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    Title *
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: "#000", borderColor: borderColor }]}
                    placeholder="Enter recipe title"
                    placeholderTextColor={iconColor}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />
                </View>

                {/* Description Input */}
                <View style={styles.inputContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    Description *
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.textArea,
                      { color: "#000", borderColor: borderColor },
                    ]}
                    placeholder="Describe your recipe..."
                    placeholderTextColor={iconColor}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Category Picker */}
                <View style={styles.inputContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    Category *
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContainer}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setFormData({ ...formData, category_id: category.id })}
                        style={[
                          styles.categoryChip,
                          formData.category_id === category.id && [
                            styles.categoryChipActive,
                            { backgroundColor: tintColor },
                          ],
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.categoryChipText,
                            formData.category_id === category.id && styles.categoryChipTextActive,
                          ]}
                        >
                          {category.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            </SafeAreaView>
          </ImageBackground>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTitle: {
    fontSize: 28,
    color: "#080808",
  },
  cameraButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imagesHeader: {
    fontSize: 18,
    marginBottom: 16,
    paddingHorizontal: 24,
    color: "#080808",
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 8,
  },
  imageWrapper: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 48,
  },
  emptyText: {
    marginTop: 24,
    marginBottom: 12,
    color: "#080808",
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    color: "#080808",
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#080808",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formScrollView: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 24,
  },
  imagePreviewContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  inputContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#080808",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: "#fff",
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#83ab64",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#080808",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});

