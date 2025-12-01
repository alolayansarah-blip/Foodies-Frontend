import { useState } from "react";
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Mock search results
const mockRecipes = [
  { id: "1", name: "Homemade Pasta", category: "Italian", rating: 4.5 },
  { id: "2", name: "Chocolate Cake", category: "Dessert", rating: 4.8 },
  { id: "3", name: "Grilled Salmon", category: "Seafood", rating: 4.6 },
  { id: "4", name: "Vegetable Stir Fry", category: "Vegetarian", rating: 4.4 },
  { id: "5", name: "Beef Steak", category: "Meat", rating: 4.7 },
  { id: "6", name: "Caesar Salad", category: "Salad", rating: 4.3 },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockRecipes>([]);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Search
          </ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <ThemedView style={styles.searchContainer}>
          <ThemedView
            style={[
              styles.searchBar,
              { backgroundColor: backgroundColor, borderColor: borderColor },
            ]}
          >
            <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search recipes, ingredients..."
              placeholderTextColor={iconColor}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <IconSymbol name="xmark.circle.fill" size={20} color={iconColor} />
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass.fill" size={60} color={iconColor} />
              <ThemedText type="subtitle" style={styles.emptyText}>
                Start searching
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Search for recipes, ingredients, or categories
              </ThemedText>
            </ThemedView>
          ) : searchResults.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass.fill" size={60} color={iconColor} />
              <ThemedText type="subtitle" style={styles.emptyText}>
                No results found
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Try a different search term
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.resultsContainer}>
              <ThemedText type="defaultSemiBold" style={styles.resultsHeader}>
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
              </ThemedText>
              {searchResults.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[styles.resultItem, { borderBottomColor: borderColor }]}
                >
                  <ThemedView style={styles.resultContent}>
                    <ThemedText type="defaultSemiBold" style={styles.resultName}>
                      {recipe.name}
                    </ThemedText>
                    <ThemedView style={styles.resultMeta}>
                      <ThemedText style={styles.resultCategory}>{recipe.category}</ThemedText>
                      <ThemedView style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={14} color={tintColor} />
                        <ThemedText style={[styles.rating, { color: tintColor }]}>
                          {recipe.rating}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={20} color={iconColor} />
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
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
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 48,
  },
  resultsContainer: {
    paddingHorizontal: 24,
  },
  resultsHeader: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultCategory: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
});

