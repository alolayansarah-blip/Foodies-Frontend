import { SearchSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { styles } from "@/styles/search";
import { Ionicons } from "@expo/vector-icons";
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

interface Recipe {
  id: string;
  name?: string;
  title?: string;
  category?:
    | string
    | string[]
    | Array<{ _id?: string; categoryName?: string; name?: string }>
    | { _id?: string; categoryName?: string; name?: string };
  category_id?: string;
  image?: string | null;
  rating?: number;
  description?: string;
}

type CategoryType = "All" | "Recipes" | "Ingredients" | "Categories";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
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

  const categories: CategoryType[] = [
    "All",
    "Recipes",
    "Ingredients",
    "Categories",
  ];

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Handle different response formats
          const recipesData = Array.isArray(data)
            ? data
            : data.recipes || data.data || [];
          setRecipes(recipesData);
        } else {
          console.error("Failed to fetch recipes:", response.status);
          // Set empty array on error
          setRecipes([]);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        // Set empty array on error
        setRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
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

  // Filter recipes based on active category
  const getFilteredRecipes = () => {
    if (activeCategory === "All") {
      return recipes;
    }

    return recipes.filter((recipe) => {
      switch (activeCategory) {
        case "Recipes":
          // Show all recipes (same as All)
          return true;

        case "Ingredients":
          // For now, show all recipes
          // In the future, this could filter by ingredients if ingredient data is available
          return true;

        case "Categories":
          // Filter recipes that have categories
          if (recipe.category) {
            if (Array.isArray(recipe.category) && recipe.category.length > 0) {
              return true;
            }
            if (
              typeof recipe.category === "object" &&
              recipe.category !== null
            ) {
              return true;
            }
            if (
              typeof recipe.category === "string" &&
              recipe.category.trim() !== ""
            ) {
              return true;
            }
          }
          return false;

        default:
          return true;
      }
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
            {/* Category Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={[
                    styles.categoryTab,
                    activeCategory === category && styles.activeCategoryTab,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      activeCategory === category && styles.activeCategoryText,
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
                    {activeCategory === "Categories"
                      ? "No recipes with categories found"
                      : activeCategory === "Ingredients"
                      ? "No recipes with ingredients found"
                      : "Recipes will appear here once they're posted"}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.recipeGrid}>
                  {filteredRecipes.map((recipe, index) => (
                    <TouchableOpacity
                      key={
                        recipe.id || (recipe as any)._id || `recipe-${index}`
                      }
                      style={styles.recipeCard}
                      onPress={() => {
                        const recipeId = recipe.id || (recipe as any)._id;
                        if (recipeId) {
                          router.push(`/recipe/${recipeId}` as any);
                        }
                      }}
                    >
                      <View style={styles.recipeContent}>
                        {/* Categories */}
                        {recipe.category && (
                          <View style={styles.recipeCategories}>
                            {Array.isArray(recipe.category) ? (
                              recipe.category.map((cat: any, index: number) => (
                                <View
                                  key={index}
                                  style={styles.recipeCategoryTag}
                                >
                                  <ThemedText style={styles.recipeCategoryText}>
                                    {cat.categoryName || cat.name || cat}
                                  </ThemedText>
                                </View>
                              ))
                            ) : (
                              <View style={styles.recipeCategoryTag}>
                                <ThemedText style={styles.recipeCategoryText}>
                                  {typeof recipe.category === "string"
                                    ? recipe.category
                                    : (recipe.category as any)?.categoryName ||
                                      (recipe.category as any)?.name ||
                                      "Uncategorized"}
                                </ThemedText>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
