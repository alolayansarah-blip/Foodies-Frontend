import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { Category, createCategory, getCategories, getCategoryById } from "@/services/categories";
import { getRecipes, Recipe } from "@/services/recipes";
import { styles } from "@/styles/home";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Default "All" category (not stored in backend)
const ALL_CATEGORY = { id: "all", name: "All", icon: "food" };

// Available icons for category selection
const availableIcons = [
  "food",
  "coffee",
  "bowl-mix",
  "silverware-fork-knife",
  "cupcake",
  "cookie",
  "leaf",
  "sprout",
  "pizza",
  "hamburger",
  "noodles",
  "ice-cream",
  "bread-slice",
  "fish",
  "fruit-grapes",
  "carrot",
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<
    Array<Category & { icon?: string }>
  >([ALL_CATEGORY]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllRecipesModal, setShowAllRecipesModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("food");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const isLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch recipes on mount and when category changes
  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  // Refresh recipes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [selectedCategory])
  );

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const apiCategories = await getCategories();

      // Ensure apiCategories is an array
      if (!Array.isArray(apiCategories)) {
        console.error("Categories response is not an array:", apiCategories);
        setCategories([ALL_CATEGORY]);
        return;
      }

      // Map API categories and add icon field (using first letter or default)
      // Backend uses _id, so map it to id for frontend
      const mappedCategories = apiCategories.map((cat) => ({
        ...cat,
        id: cat.id || cat._id || String(Date.now() + Math.random()), // Use _id if id doesn't exist
        name: cat.categoryName || cat.name || "",
        icon: "food", // Default icon, can be enhanced later
      }));
      setCategories([ALL_CATEGORY, ...mappedCategories]);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
      setCategories([ALL_CATEGORY]); // Set default "All" category on error
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setIsLoadingRecipes(true);
      const params: any = {};

      // If a specific category is selected (not "all"), filter by category_id
      if (selectedCategory !== "all") {
        const selectedCat = categories.find(
          (cat) => cat.id === selectedCategory || (cat as any)._id === selectedCategory
        );
        if (selectedCat && selectedCat.id !== "all") {
          // Prioritize _id for backend (ObjectId format)
          params.category_id = (selectedCat as any)._id || selectedCat.id;
        }
      }

      const apiRecipes = await getRecipes(params);

      // Ensure apiRecipes is an array
      if (!Array.isArray(apiRecipes)) {
        console.error("Recipes response is not an array:", apiRecipes);
        setRecipes([]);
        return;
      }

      // Map API recipes to match our format (new recipe format: title, image, categories, ingredients, steps)
      // Based on schema: category_id is ObjectId reference, category may be populated
      const mappedRecipesPromises = apiRecipes.map(async (recipe: any) => {
        // Handle category based on schema structure
        // Schema has category_id (ObjectId ref), category may be populated
        let categoryData = null;
        const categoryId = recipe.category_id || recipe.categoryId || "";
        
        // If category is populated (object), use it
        if (recipe.category && typeof recipe.category === "object" && !Array.isArray(recipe.category)) {
          categoryData = {
            _id: recipe.category._id || recipe.category.id || categoryId,
            categoryName: recipe.category.categoryName || recipe.category.name || "",
          };
        }
        // If category_id exists but category is not populated, fetch it
        else if (categoryId) {
          try {
            const category = await getCategoryById(categoryId);
            categoryData = {
              _id: categoryId,
              categoryName: category.categoryName || category.name || "",
            };
          } catch (error) {
            console.error(`Error fetching category ${categoryId}:`, error);
            // If fetch fails, just store the ID
            categoryData = {
              _id: categoryId,
              categoryName: "",
            };
          }
        }

        return {
          ...recipe,
          id: recipe.id || recipe._id || String(Date.now() + Math.random()),
          title: recipe.title || recipe.name || recipe.recipeName || "",
          image: getImageUrl(
            recipe.image ||
              recipe.imageUrl ||
              recipe.imagePath ||
              recipe.photo ||
              recipe.photoUrl
          ),
          // Category structure based on schema
          category: categoryData ? [categoryData] : [],
          category_id: categoryId,
          // Keep description (which is steps/directions)
          description: recipe.description || "",
          // Keep ingredients array if available
          ingredients: recipe.ingredients || [],
          createdAt:
            recipe.createdAt || recipe.date || new Date().toISOString(),
          updatedAt:
            recipe.updatedAt || recipe.createdAt || new Date().toISOString(),
        };
      });
      
      const mappedRecipes = await Promise.all(mappedRecipesPromises);
      setRecipes(mappedRecipes);
    } catch (error: any) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error", "Failed to load recipes");
      setRecipes([]); // Set empty array on error
    } finally {
      setIsLoadingRecipes(false);
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    // Check if category name already exists
    if (
      categories.some(
        (cat) =>
          cat.name?.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      Alert.alert("Error", "A category with this name already exists");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const newCategory = await createCategory({
        categoryName: newCategoryName.trim(),
        name: newCategoryName.trim(),
      });

      // Add to local state with icon
      const categoryWithIcon = {
        ...newCategory,
        name: newCategory.categoryName || newCategory.name || "",
        icon: selectedIcon,
      };

      setCategories([ALL_CATEGORY, ...categories.slice(1), categoryWithIcon]);
      setNewCategoryName("");
      setSelectedIcon("food");
      setShowCategoryModal(false);
      Alert.alert("Success", "Category created successfully!");
    } catch (error: any) {
      console.error("Error creating category:", error);
      Alert.alert("Error", error?.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const filteredRecipes =
    selectedCategory === "all"
      ? recipes
      : recipes.filter((recipe) => recipe.category_id === selectedCategory);

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories Scroll View */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {isLoadingCategories ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialCommunityIcons
                    name={(category.icon || "food") as any}
                    size={20}
                    color={selectedCategory === category.id ? "#fff" : "#fff"}
                  />
                  <ThemedText
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name || category.categoryName || ""}
                  </ThemedText>
                </TouchableOpacity>
              ))
            )}
            {/* Add Category Button */}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recipes List */}
        <View style={styles.recipesSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Latest Recipes</ThemedText>
            <TouchableOpacity
              onPress={() => setShowAllRecipesModal(true)}
              style={styles.viewAllButton}
            >
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          {isLoadingRecipes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No recipes found</ThemedText>
            </View>
          ) : (
            filteredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                activeOpacity={0.8}
                onPress={() => {
                  const recipeId = recipe.id || (recipe as any)._id;
                  if (recipeId) {
                    router.push(`/recipe/${recipeId}` as any);
                  }
                }}
              >
                {/* Recipe Image */}
                {recipe.image ? (
                  <Image
                    source={{ uri: recipe.image }}
                    style={styles.recipeImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.recipeImagePlaceholder}>
                    <MaterialCommunityIcons name="food" size={40} color="rgba(255, 255, 255, 0.5)" />
                  </View>
                )}
                
                {/* Recipe Content */}
                <View style={styles.recipeContent}>
                  {/* Recipe Title */}
                  <ThemedText style={styles.recipeName} numberOfLines={2}>
                    {recipe.title || recipe.name || "Untitled Recipe"}
                  </ThemedText>
                  
                  {/* Description Summary */}
                  {recipe.description && (
                    <ThemedText style={styles.recipeDescription} numberOfLines={3}>
                      {recipe.description.length > 120
                        ? `${recipe.description.substring(0, 120)}...`
                        : recipe.description}
                    </ThemedText>
                  )}
                  
                  {/* Categories */}
                  {(() => {
                    let hasCategories = false;
                    let categoryElements = null;

                    if (Array.isArray(recipe.category) && recipe.category.length > 0) {
                      hasCategories = true;
                      categoryElements = recipe.category.map((cat: any, index: number) => {
                        const categoryName = typeof cat === 'string' 
                          ? cat 
                          : (cat?.categoryName || cat?.name || "");
                        if (!categoryName) return null;
                        return (
                          <View key={index} style={styles.recipeCategoryTag}>
                            <ThemedText style={styles.recipeCategoryText}>
                              {categoryName}
                            </ThemedText>
                          </View>
                        );
                      }).filter(Boolean);
                    } else if (recipe.category && typeof recipe.category === "object") {
                      const categoryName = recipe.category.categoryName || recipe.category.name || "";
                      if (categoryName) {
                        hasCategories = true;
                        categoryElements = (
                          <View style={styles.recipeCategoryTag}>
                            <ThemedText style={styles.recipeCategoryText}>
                              {categoryName}
                            </ThemedText>
                          </View>
                        );
                      }
                    } else if (typeof recipe.category === "string" && recipe.category) {
                      hasCategories = true;
                      categoryElements = (
                        <View style={styles.recipeCategoryTag}>
                          <ThemedText style={styles.recipeCategoryText}>
                            {recipe.category}
                          </ThemedText>
                        </View>
                      );
                    }

                    return hasCategories ? (
                      <View style={styles.recipeCategories}>
                        {categoryElements}
                      </View>
                    ) : null;
                  })()}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Create New Category
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setSelectedIcon("food");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Category Name Input */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Category Name</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter category name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Icon Selection */}

              <View style={styles.iconSelectionContainer}>
                <ThemedText style={styles.inputLabel}>Select Icon</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.iconScrollContainer}
                >
                  {availableIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        selectedIcon === icon && styles.iconOptionActive,
                      ]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={24}
                        color={selectedIcon === icon ? "#1a4d2e" : "#fff"}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  isCreatingCategory && styles.createButtonDisabled,
                ]}
                onPress={handleCreateCategory}
                activeOpacity={0.85}
                disabled={isCreatingCategory}
              >
                {isCreatingCategory ? (
                  <ActivityIndicator size="small" color="#1a4d2e" />
                ) : (
                  <ThemedText style={styles.createButtonText}>
                    Create Category
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View All Recipes Modal */}
      <Modal
        visible={showAllRecipesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllRecipesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.allRecipesModalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>All Recipes</ThemedText>
              <TouchableOpacity
                onPress={() => setShowAllRecipesModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.allRecipesScrollView}
              contentContainerStyle={styles.allRecipesScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.allRecipesCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    const recipeId = recipe.id || (recipe as any)._id;
                    if (recipeId) {
                      setShowAllRecipesModal(false);
                      router.push(`/recipe/${recipeId}` as any);
                    }
                  }}
                >
                  {/* Recipe Image */}
                  {recipe.image ? (
                    <Image
                      source={{ uri: recipe.image }}
                      style={styles.allRecipesImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.allRecipesImagePlaceholder}>
                      <MaterialCommunityIcons name="food" size={40} color="rgba(255, 255, 255, 0.5)" />
                    </View>
                  )}
                  
                  {/* Recipe Content */}
                  <View style={styles.allRecipesContent}>
                    {/* Recipe Title */}
                    <ThemedText style={styles.allRecipesName} numberOfLines={2}>
                      {recipe.title || recipe.name || "Untitled Recipe"}
                    </ThemedText>
                    
                    {/* Description Summary */}
                    {recipe.description && (
                      <ThemedText style={styles.allRecipesDescription} numberOfLines={2}>
                        {recipe.description.length > 100
                          ? `${recipe.description.substring(0, 100)}...`
                          : recipe.description}
                      </ThemedText>
                    )}
                    
                    {/* Categories */}
                    {(() => {
                      let hasCategories = false;
                      let categoryElements = null;

                      if (Array.isArray(recipe.category) && recipe.category.length > 0) {
                        hasCategories = true;
                        categoryElements = recipe.category.map((cat: any, index: number) => {
                          const categoryName = typeof cat === 'string' 
                            ? cat 
                            : (cat?.categoryName || cat?.name || "");
                          if (!categoryName) return null;
                          return (
                            <View key={index} style={styles.recipeCategoryTag}>
                              <ThemedText style={styles.recipeCategoryText}>
                                {categoryName}
                              </ThemedText>
                            </View>
                          );
                        }).filter(Boolean);
                      } else if (recipe.category && typeof recipe.category === "object") {
                        const categoryName = recipe.category.categoryName || recipe.category.name || "";
                        if (categoryName) {
                          hasCategories = true;
                          categoryElements = (
                            <View style={styles.recipeCategoryTag}>
                              <ThemedText style={styles.recipeCategoryText}>
                                {categoryName}
                              </ThemedText>
                            </View>
                          );
                        }
                      } else if (typeof recipe.category === "string" && recipe.category) {
                        hasCategories = true;
                        categoryElements = (
                          <View style={styles.recipeCategoryTag}>
                            <ThemedText style={styles.recipeCategoryText}>
                              {recipe.category}
                            </ThemedText>
                          </View>
                        );
                      }

                      return hasCategories ? (
                        <View style={styles.recipeCategories}>
                          {categoryElements}
                        </View>
                      ) : null;
                    })()}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
