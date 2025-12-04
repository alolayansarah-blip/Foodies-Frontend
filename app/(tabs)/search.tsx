import { SearchSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { Category, getCategories } from "@/services/categories";
import { getRecipes, Recipe } from "@/services/recipes";
import { styles } from "@/styles/search";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Get API base URL from environment variable
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://your-api-url.com";

// Default "All" category (not stored in backend)
const ALL_CATEGORY = { id: "all", name: "All", icon: "apps" };

// Get category icon based on name
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes("dessert")) {
    return "cupcake";
  }
  if (name.includes("pizza")) {
    return "pizza";
  }
  if (name.includes("coffee")) {
    return "coffee";
  }
  if (name.includes("salad")) {
    return "leaf";
  }
  if (name.includes("bowl")) {
    return "bowl-mix";
  }
  if (name.includes("sandwich")) {
    return "hamburger";
  }
  if (name.includes("healthy")) {
    return "sprout";
  }
  return "food";
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([ALL_CATEGORY]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const isNavigationLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const apiCategories = await getCategories();

      if (!Array.isArray(apiCategories)) {
        console.error("Categories response is not an array:", apiCategories);
        setCategories([ALL_CATEGORY]);
        return;
      }

      const mappedCategories = apiCategories.map((cat) => {
        const categoryName = cat.name || cat.categoryName || "";
        return {
          ...cat,
          _id: cat._id || cat.id,
          id: cat._id || cat.id || String(Date.now() + Math.random()),
          name: categoryName,
          icon: getCategoryIcon(categoryName),
        };
      });
      setCategories([ALL_CATEGORY, ...mappedCategories]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([ALL_CATEGORY]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const recipesData = await getRecipes();
        setRecipes(recipesData);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
    fetchCategories();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = recipes.filter((recipe) => {
        const name = (recipe.name || recipe.title || "").toLowerCase();
        // Handle different category types
        let categoryStr = "";
        if (recipe.category) {
          if (Array.isArray(recipe.category)) {
            categoryStr = recipe.category
              .map((cat) =>
                typeof cat === "string"
                  ? cat
                  : (cat as any)?.categoryName || (cat as any)?.name || ""
              )
              .filter(Boolean)
              .join(" ");
          } else if (typeof recipe.category === "string") {
            categoryStr = recipe.category;
          } else {
            categoryStr =
              (recipe.category as any)?.categoryName ||
              (recipe.category as any)?.name ||
              "";
          }
        }
        const category = categoryStr.toLowerCase();
        const searchLower = query.toLowerCase();
        return name.includes(searchLower) || category.includes(searchLower);
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  // Filter recipes based on selected category
  const getFilteredRecipes = () => {
    if (selectedCategory === "all") {
      return recipes;
    }

    return recipes.filter((recipe) => {
      const recipeCategoryId =
        recipe.category_id ||
        (recipe.category as any)?._id ||
        (recipe.category as any)?.id;
      return recipeCategoryId === selectedCategory;
    });
  };

  const filteredRecipes = getFilteredRecipes();

  if (isNavigationLoading) {
    return (
      <View style={styles.container}>
        <SearchSkeleton />
      </View>
    );
  }

  const isSearching = searchQuery.length > 0;

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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color="rgba(255, 255, 255, 0.8)"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="rgba(255, 255, 255, 0.7)"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isSearching ? (
          /* Search Results */
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={60}
                  color="rgba(255, 255, 255, 0.6)"
                />
                <ThemedText style={styles.emptyText}>
                  No results found
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Try a different search term
                </ThemedText>
              </View>
            ) : (
              <View style={styles.resultsContainer}>
                <ThemedText style={styles.resultsHeader}>
                  {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""} found
                </ThemedText>
                {searchResults.map((recipe, index) => (
                  <TouchableOpacity
                    key={
                      recipe.id ||
                      (recipe as any)._id ||
                      `search-result-${index}`
                    }
                    style={styles.resultItem}
                    onPress={() => {
                      const recipeId = recipe.id || (recipe as any)._id;
                      if (recipeId) {
                        router.push(`/recipe/${recipeId}` as any);
                      }
                    }}
                  >
                    <View style={styles.resultContent}>
                      <ThemedText style={styles.resultName}>
                        {recipe.name || recipe.title || "Untitled Recipe"}
                      </ThemedText>
                      <View style={styles.resultMeta}>
                        {recipe.category && (
                          <ThemedText style={styles.resultCategory}>
                            {Array.isArray(recipe.category)
                              ? recipe.category
                                  .map((cat) =>
                                    typeof cat === "string"
                                      ? cat
                                      : (cat as any)?.categoryName ||
                                        (cat as any)?.name ||
                                        ""
                                  )
                                  .filter(Boolean)
                                  .join(", ") || "Uncategorized"
                              : typeof recipe.category === "string"
                              ? recipe.category
                              : (recipe.category as any)?.categoryName ||
                                (recipe.category as any)?.name ||
                                "Uncategorized"}
                          </ThemedText>
                        )}
                        {recipe.rating && (
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#ffa500" />
                            <ThemedText style={styles.rating}>
                              {recipe.rating}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        ) : (
          /* Explore Grid View */
          <View style={styles.exploreContainer}>
            {/* Categories Section */}
            <View style={styles.categoriesSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {isLoadingCategories ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  categories.map((category) => {
                    const categoryName =
                      category.name || category.categoryName || "";
                    const isActive = selectedCategory === category.id;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          isActive && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                        activeOpacity={0.8}
                      >
                        {isActive && <View style={styles.categoryActiveGlow} />}
                        <View
                          style={[
                            styles.categoryIconContainer,
                            isActive && styles.categoryIconContainerActive,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={(category.icon || "food") as any}
                            size={32}
                            color={
                              isActive ? "#0d2818" : "rgba(255, 255, 255, 0.9)"
                            }
                          />
                        </View>
                        <ThemedText
                          style={[
                            styles.categoryText,
                            isActive && styles.categoryTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {categoryName}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>

            {/* Recipe Grid */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoadingRecipes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <ThemedText style={styles.loadingText}>
                    Loading recipes...
                  </ThemedText>
                </View>
              ) : filteredRecipes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="restaurant-outline"
                    size={60}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.emptyText}>
                    No recipes found
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    {selectedCategory === "all"
                      ? "Recipes will appear here once they're posted"
                      : "No recipes found in this category"}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.recipeGrid}>
                  {filteredRecipes.map((recipe, index) => {
                    const recipeId = recipe.id || (recipe as any)._id;
                    const recipeImage = recipe.image
                      ? getImageUrl(recipe.image)
                      : null;
                    const recipeName =
                      recipe.title || recipe.name || "Untitled Recipe";

                    return (
                      <TouchableOpacity
                        key={recipeId || `recipe-${index}`}
                        style={styles.recipeCard}
                        onPress={() => {
                          if (recipeId) {
                            router.push(`/recipe/${recipeId}` as any);
                          }
                        }}
                        activeOpacity={0.9}
                      >
                        {recipeImage ? (
                          <Image
                            source={{ uri: recipeImage }}
                            style={styles.recipeImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.recipeImagePlaceholder}>
                            <MaterialCommunityIcons
                              name="food"
                              size={40}
                              color="rgba(255, 255, 255, 0.5)"
                            />
                          </View>
                        )}
                        <View style={styles.recipeOverlay}>
                          <ThemedText
                            style={styles.recipeCardName}
                            numberOfLines={2}
                          >
                            {recipeName}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
