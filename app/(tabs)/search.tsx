import { SearchSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock recipes for grid view
const mockExploreRecipes = [
  { id: "1", name: "Homemade Pasta", category: "Italian", image: null },
  { id: "2", name: "Chocolate Cake", category: "Dessert", image: null },
  { id: "3", name: "Grilled Salmon", category: "Seafood", image: null },
  { id: "4", name: "Vegetable Stir Fry", category: "Vegetarian", image: null },
  { id: "5", name: "Beef Steak", category: "Meat", image: null },
  { id: "6", name: "Caesar Salad", category: "Salad", image: null },
  { id: "7", name: "Margherita Pizza", category: "Italian", image: null },
  { id: "8", name: "Chicken Curry", category: "Asian", image: null },
  { id: "9", name: "Apple Pie", category: "Dessert", image: null },
];

// Mock search results
const mockRecipes = [
  { id: "1", name: "Homemade Pasta", category: "Italian", rating: 4.5 },
  { id: "2", name: "Chocolate Cake", category: "Dessert", rating: 4.8 },
  { id: "3", name: "Grilled Salmon", category: "Seafood", rating: 4.6 },
  { id: "4", name: "Vegetable Stir Fry", category: "Vegetarian", rating: 4.4 },
  { id: "5", name: "Beef Steak", category: "Meat", rating: 4.7 },
  { id: "6", name: "Caesar Salad", category: "Salad", rating: 4.3 },
];

type CategoryType = "All" | "Recipes" | "Ingredients" | "Categories";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockRecipes>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const isLoading = useNavigationLoading();

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = "#83ab64";

  const categories: CategoryType[] = [
    "All",
    "Recipes",
    "Ingredients",
    "Categories",
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = mockRecipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SearchSkeleton />
      </ImageBackground>
    );
  }

  const isSearching = searchQuery.length > 0;

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search"
                placeholderTextColor={iconColor}
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={20}
                    color={iconColor}
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
                  <IconSymbol
                    name="magnifyingglass"
                    size={60}
                    color={iconColor}
                  />
                  <ThemedText type="subtitle" style={styles.emptyText}>
                    No results found
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    Try a different search term
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.resultsContainer}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.resultsHeader}
                  >
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} found
                  </ThemedText>
                  {searchResults.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      style={[
                        styles.resultItem,
                        { borderBottomColor: borderColor },
                      ]}
                    >
                      <View style={styles.resultContent}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={styles.resultName}
                        >
                          {recipe.name}
                        </ThemedText>
                        <View style={styles.resultMeta}>
                          <ThemedText style={styles.resultCategory}>
                            {recipe.category}
                          </ThemedText>
                          <View style={styles.ratingContainer}>
                            <IconSymbol
                              name="star.fill"
                              size={14}
                              color={tintColor}
                            />
                            <ThemedText
                              style={[styles.rating, { color: tintColor }]}
                            >
                              {recipe.rating}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      <IconSymbol
                        name="chevron.right"
                        size={20}
                        color={iconColor}
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
                      activeCategory === category && [
                        styles.activeCategoryTab,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryText,
                        activeCategory === category &&
                          styles.activeCategoryText,
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
                <View style={styles.recipeGrid}>
                  {mockExploreRecipes.map((recipe) => (
                    <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                      <ThemedView style={styles.recipeImageContainer}>
                        {recipe.image ? (
                          <View style={styles.recipeImagePlaceholder} />
                        ) : (
                          <IconSymbol
                            name="book.fill"
                            size={30}
                            color={iconColor}
                          />
                        )}
                      </ThemedView>
                      <ThemedText
                        style={styles.recipeCardName}
                        numberOfLines={1}
                      >
                        {recipe.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    color: "#080808",
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 48,
    color: "#080808",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  resultsHeader: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
    color: "#080808",
    paddingHorizontal: 8,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  resultContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  resultName: {
    fontSize: 16,
    marginBottom: 4,
    color: "#080808",
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "transparent",
  },
  resultCategory: {
    fontSize: 14,
    opacity: 0.7,
    color: "#080808",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "transparent",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
  exploreContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginRight: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  activeCategoryTab: {
    backgroundColor: "#83ab64",
  },
  categoryText: {
    fontSize: 14,
    color: "#080808",
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  gridContent: {
    paddingBottom: 24,
  },
  recipeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 2,
  },
  recipeCard: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 1,
  },
  recipeImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 4,
  },
  recipeCardName: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    fontSize: 10,
    color: "#080808",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: "center",
  },
});
