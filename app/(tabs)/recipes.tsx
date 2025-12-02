import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Collapsible } from "@/components/ui/collapsible";

// Mock recipes with ingredients
const mockRecipes = [
  {
    id: "1",
    name: "Homemade Pasta",
    category: "Italian",
    rating: 4.5,
    cookTime: "30 min",
    ingredients: ["Flour", "Eggs", "Salt", "Olive oil", "Water"],
    description: "Fresh homemade pasta that's perfect for any sauce.",
  },
  {
    id: "2",
    name: "Chocolate Cake",
    category: "Dessert",
    rating: 4.8,
    cookTime: "45 min",
    ingredients: ["Flour", "Sugar", "Cocoa powder", "Eggs", "Butter", "Milk"],
    description: "Rich and moist chocolate cake that everyone will love.",
  },
  {
    id: "3",
    name: "Grilled Salmon",
    category: "Seafood",
    rating: 4.6,
    cookTime: "20 min",
    ingredients: ["Salmon fillet", "Lemon", "Olive oil", "Salt", "Pepper", "Dill"],
    description: "Perfectly grilled salmon with fresh herbs and lemon.",
  },
  {
    id: "4",
    name: "Vegetable Stir Fry",
    category: "Vegetarian",
    rating: 4.4,
    cookTime: "15 min",
    ingredients: ["Broccoli", "Carrots", "Bell peppers", "Soy sauce", "Garlic", "Ginger"],
    description: "Quick and healthy vegetable stir fry packed with flavor.",
  },
  {
    id: "5",
    name: "Beef Steak",
    category: "Meat",
    rating: 4.7,
    cookTime: "25 min",
    ingredients: ["Beef steak", "Butter", "Garlic", "Rosemary", "Salt", "Pepper"],
    description: "Juicy and tender beef steak cooked to perfection.",
  },
];

export default function RecipesScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Recipes
          </ThemedText>
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mockRecipes.map((recipe, index) => (
            <ThemedView
              key={recipe.id}
              style={[
                styles.recipeCard,
                { borderColor: borderColor },
                index === mockRecipes.length - 1 && styles.lastCard,
              ]}
            >
              <ThemedView style={styles.recipeHeader}>
                <ThemedView style={styles.recipeTitleContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.recipeName}>
                    {recipe.name}
                  </ThemedText>
                  <ThemedView style={styles.recipeMeta}>
                    <ThemedText style={styles.recipeCategory}>{recipe.category}</ThemedText>
                    <ThemedView style={styles.ratingContainer}>
                      <IconSymbol name="star.fill" size={14} color={tintColor} />
                      <ThemedText style={[styles.rating, { color: tintColor }]}>
                        {recipe.rating}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.timeContainer}>
                      <IconSymbol name="clock.fill" size={14} color={iconColor} />
                      <ThemedText style={styles.cookTime}>{recipe.cookTime}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              <ThemedText style={styles.recipeDescription}>{recipe.description}</ThemedText>

              <Collapsible title="Ingredients">
                <ThemedView style={styles.ingredientsList}>
                  {recipe.ingredients.map((ingredient, idx) => (
                    <ThemedView key={idx} style={styles.ingredientItem}>
                      <IconSymbol name="circle.fill" size={6} color={tintColor} />
                      <ThemedText style={styles.ingredientText}>{ingredient}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </Collapsible>
            </ThemedView>
          ))}
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
  recipeCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  lastCard: {
    marginBottom: 16,
  },
  recipeHeader: {
    marginBottom: 8,
  },
  recipeTitleContainer: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  recipeCategory: {
    fontSize: 12,
    opacity: 0.7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 6,
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
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cookTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  recipeDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  ingredientsList: {
    marginTop: 8,
    gap: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ingredientText: {
    fontSize: 14,
    opacity: 0.8,
  },
});

