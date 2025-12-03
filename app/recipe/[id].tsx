import { ThemedText } from "@/components/themed-text";
import { config } from "@/constants/config";
import { getCategoryById } from "@/services/categories";
import { getIngredientsByRecipe } from "@/services/recipeIngredients";
import { getRecipeById } from "@/services/recipes";
import { styles } from "@/styles/recipeDetail";
import RecipeType from "@/types/RecipeType";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle both string and array formats from useLocalSearchParams
    const recipeId = Array.isArray(id) ? id[0] : id;
    if (recipeId) {
      fetchRecipe(recipeId);
    } else {
      setError("Recipe ID is missing");
      setIsLoading(false);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!recipeId) {
        throw new Error("Recipe ID is required");
      }

      // Helper function to extract user data
      const extractUserData = (recipeData: any) => {
        console.log("Extracting user data from:", JSON.stringify(recipeData, null, 2));
        
        // Try nested user object first (MongoDB populated field)
        if (recipeData.user) {
          const user = recipeData.user;
          // Handle both object and string (ObjectId) cases
          if (typeof user === 'object' && user !== null) {
            const userData = {
              _id:
                user._id?.toString() ||
                user.id?.toString() ||
                recipeData.user_id?.toString() ||
                recipeData.userId?.toString() ||
                "",
              userName:
                user.userName ||
                user.name ||
                user.username ||
                user.user_name ||
                recipeData.userName ||
                "",
              userProfilePicture:
                user.userProfilePicture ||
                user.profileImage ||
                user.avatar ||
                user.profile_picture ||
                null,
            };
            console.log("Extracted user data from nested user object:", userData);
            return userData;
          }
        }
        
        // Try top-level user fields
        if (recipeData.user_id || recipeData.userId) {
          const userData = {
            _id: (recipeData.user_id || recipeData.userId)?.toString() || "",
            userName: recipeData.userName || recipeData.username || recipeData.user_name || "",
            userProfilePicture: recipeData.userProfilePicture || recipeData.profileImage || null,
          };
          console.log("Extracted user data from top-level fields:", userData);
          return userData;
        }
        
        // Try to find user data in any nested structure
        if (recipeData.createdBy) {
          const createdBy = recipeData.createdBy;
          if (typeof createdBy === 'object' && createdBy !== null) {
            return {
              _id: createdBy._id?.toString() || createdBy.id?.toString() || "",
              userName: createdBy.userName || createdBy.name || createdBy.username || "",
              userProfilePicture: createdBy.userProfilePicture || createdBy.profileImage || null,
            };
          }
        }
        
        console.log("No user data found in recipe data");
        return null;
      };

      // Try using the service first
      try {
        const recipeData = await getRecipeById(recipeId);
        console.log(
          "Recipe detail API response:",
          JSON.stringify(recipeData, null, 2)
        );

        // Ensure we have the actual recipe object (handle MongoDB _id)
        const actualRecipe = recipeData || {};
        
        const userData = extractUserData(actualRecipe);
        console.log("Extracted userData:", userData);
        
        const imageUrl = getImageUrl(
          actualRecipe.image ||
            (actualRecipe as any).imageUrl ||
            (actualRecipe as any).imagePath ||
            (actualRecipe as any).photo ||
            (actualRecipe as any).photoUrl
        );

        // Map the response to RecipeType format
        // MongoDB uses _id, so prioritize _id over id
        const mappedRecipeIdMain: string = (actualRecipe as any)._id || actualRecipe.id || recipeId;
        
        // Ensure user data is properly set
        const finalUserData = userData || {
          _id: (actualRecipe as any).user_id?.toString() || (actualRecipe as any).userId?.toString() || "",
          userName: (actualRecipe as any).userName || (actualRecipe as any).username || "",
          userProfilePicture: null,
        };
        
        console.log("Final user data being set:", finalUserData);
        
        // Extract title and description (which is steps/directions)
        const recipeTitle = actualRecipe.title || actualRecipe.name || actualRecipe.recipeName || "Untitled Recipe";
        const recipeDescription = actualRecipe.description || "";
        
        // Handle category based on schema structure
        // Schema has category_id (ObjectId ref), category may be populated
        let categoryData: Array<{ _id: string; categoryName: string }> = [];
        const categoryId = actualRecipe.category_id || actualRecipe.categoryId || "";
        
        // If category is populated (object), use it
        if (actualRecipe.category && typeof actualRecipe.category === "object" && !Array.isArray(actualRecipe.category)) {
          categoryData = [{
            _id: actualRecipe.category._id || actualRecipe.category.id || categoryId,
            categoryName: actualRecipe.category.categoryName || actualRecipe.category.name || "",
          }];
        }
        // If category_id exists but category is not populated, fetch it
        else if (categoryId) {
          try {
            const category = await getCategoryById(categoryId);
            categoryData = [{
              _id: categoryId,
              categoryName: category.categoryName || category.name || "",
            }];
          } catch (error) {
            console.error(`Error fetching category ${categoryId}:`, error);
            // If fetch fails, just store the ID
            categoryData = [{
              _id: categoryId,
              categoryName: "",
            }];
          }
        }
        
        const mappedRecipe: RecipeType = {
          id: mappedRecipeIdMain,
          title: recipeTitle,
          date:
            actualRecipe.date || actualRecipe.createdAt || new Date().toISOString(),
          createdAt:
            actualRecipe.createdAt || actualRecipe.date || new Date().toISOString(),
          updatedAt:
            actualRecipe.updatedAt ||
            actualRecipe.createdAt ||
            new Date().toISOString(),
          comments: (actualRecipe as any).comments || 0,
          image: imageUrl,
          servings: 0,
          cookTime: 0,
          description: recipeDescription,
          user: finalUserData,
          category: categoryData,
        };
        setRecipe(mappedRecipe);
        
        // Fetch recipe ingredients
        const recipeIdForIngredients: string = mappedRecipeIdMain;
        try {
          const ingredients = await getIngredientsByRecipe(recipeIdForIngredients);
          setRecipeIngredients(Array.isArray(ingredients) ? ingredients : []);
        } catch (ingredientError) {
          console.error("Error fetching recipe ingredients:", ingredientError);
          setRecipeIngredients([]);
        }
      } catch (serviceError) {
        console.log("Service error, trying direct API call:", serviceError);
        // Fallback to direct API call
        const response = await fetch(`${config.API_BASE_URL}/api/recipes/${recipeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Direct API response:", JSON.stringify(data, null, 2));
          
          // Handle different response structures
          const recipeData = data.data || data;
          
          // Ensure we have the actual recipe object
          const actualRecipe = recipeData || {};

          const userData = extractUserData(actualRecipe);
          console.log("Extracted userData (fallback):", userData);
          
          const imageUrl = getImageUrl(
            actualRecipe.image ||
              (actualRecipe as any).imageUrl ||
              (actualRecipe as any).imagePath ||
              (actualRecipe as any).photo ||
              (actualRecipe as any).photoUrl
          );

          // MongoDB uses _id, so prioritize _id over id
          const mappedRecipeIdFallback: string = (actualRecipe as any)._id || actualRecipe.id || recipeId;

          // Ensure user data is properly set
          const finalUserData = userData || {
            _id: (actualRecipe as any).user_id?.toString() || (actualRecipe as any).userId?.toString() || "",
            userName: (actualRecipe as any).userName || (actualRecipe as any).username || "",
            userProfilePicture: null,
          };
          
          console.log("Final user data being set (fallback):", finalUserData);

          // Extract title and description (which is steps/directions)
          const recipeTitle = actualRecipe.title || actualRecipe.name || actualRecipe.recipeName || "Untitled Recipe";
          const recipeDescription = actualRecipe.description || "";

          // Handle category based on schema structure
          // Schema has category_id (ObjectId ref), category may be populated
          let categoryData: Array<{ _id: string; categoryName: string }> = [];
          const categoryId = actualRecipe.category_id || actualRecipe.categoryId || "";
          
          // If category is populated (object), use it
          if (actualRecipe.category && typeof actualRecipe.category === "object" && !Array.isArray(actualRecipe.category)) {
            categoryData = [{
              _id: actualRecipe.category._id || actualRecipe.category.id || categoryId,
              categoryName: actualRecipe.category.categoryName || actualRecipe.category.name || "",
            }];
          }
          // If category_id exists but category is not populated, fetch it
          else if (categoryId) {
            try {
              const category = await getCategoryById(categoryId);
              categoryData = [{
                _id: categoryId,
                categoryName: category.categoryName || category.name || "",
              }];
            } catch (error) {
              console.error(`Error fetching category ${categoryId}:`, error);
              // If fetch fails, just store the ID
              categoryData = [{
                _id: categoryId,
                categoryName: "",
              }];
            }
          }

          const mappedRecipe: RecipeType = {
            id: mappedRecipeIdFallback,
            title: recipeTitle,
            date:
              actualRecipe.date ||
              actualRecipe.createdAt ||
              new Date().toISOString(),
            createdAt:
              actualRecipe.createdAt ||
              actualRecipe.date ||
              new Date().toISOString(),
            updatedAt:
              actualRecipe.updatedAt ||
              actualRecipe.createdAt ||
              new Date().toISOString(),
            comments: (actualRecipe as any).comments || 0,
            image: imageUrl,
            servings: 0,
            cookTime: 0,
            description: recipeDescription,
            user: finalUserData,
            category: categoryData,
          };
          setRecipe(mappedRecipe);
          
          // Fetch recipe ingredients
          const recipeIdForIngredientsFallback: string = mappedRecipeIdFallback;
          try {
            const ingredients = await getIngredientsByRecipe(recipeIdForIngredientsFallback);
            setRecipeIngredients(Array.isArray(ingredients) ? ingredients : []);
          } catch (ingredientError) {
            console.error("Error fetching recipe ingredients:", ingredientError);
            setRecipeIngredients([]);
          }
        } else {
          throw new Error("Failed to fetch recipe");
        }
      }
    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError("Failed to load recipe details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: "#1a4d2e" }]}
          edges={["top", "bottom"]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <ThemedText style={styles.loadingText}>
              Loading recipe...
            </ThemedText>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: "#1a4d2e" }]}
          edges={["top", "bottom"]}
        >
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              {error || "Recipe not found"}
            </ThemedText>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10 },
          ]}
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Recipe Info */}
          <View style={styles.infoContainer}>
            {/* Recipe Image */}
            {recipe.image ? (
              <Image
                source={{ uri: recipe.image }}
                style={styles.recipeImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.recipeImagePlaceholder}>
                <MaterialCommunityIcons name="food" size={60} color="rgba(255, 255, 255, 0.5)" />
              </View>
            )}

            {/* Recipe Title */}
            <View style={styles.titleSection}>
              <ThemedText style={styles.recipeTitle}>
                {recipe.title || "Untitled Recipe"}
              </ThemedText>
            </View>

            {/* Categories */}
            {recipe.category && recipe.category.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
                <View style={styles.categoriesContainer}>
                  {recipe.category.map((cat, index) => (
                    <View key={index} style={styles.categoryTag}>
                      <ThemedText style={styles.categoryText}>
                        {cat.categoryName}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Ingredients */}
            {recipeIngredients.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
                <View style={styles.ingredientsContainer}>
                  {recipeIngredients.map((recipeIngredient, index) => {
                    const ingredient = recipeIngredient.ingredient || recipeIngredient;
                    const ingredientName = 
                      ingredient?.name || 
                      ingredient?.ingredientName || 
                      recipeIngredient?.name ||
                      "Unknown Ingredient";
                    return (
                      <View key={index} style={styles.ingredientItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <ThemedText style={styles.ingredientText}>
                          {ingredientName}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Steps / Directions */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Steps / Directions</ThemedText>
              <View style={styles.stepsWrapper}>
                <ThemedText style={styles.stepsText}>
                  {recipe.description || "No steps available."}
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

