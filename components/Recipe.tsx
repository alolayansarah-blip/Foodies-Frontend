import RecipeType from "@/types/RecipeType";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Recipe = ({ recipe }: { recipe: RecipeType }) => {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "transparent",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 20,
          width: "100%",
          borderRadius: 15,
          minHeight: 180,
          elevation: 5,
          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Categories/Cuisine Tags */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {recipe.category?.map(
            (
              category: { _id: string; categoryName: string },
              index: number
            ) => (
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 5,
                }}
                key={index}
              >
                <Text style={{ color: "white" }}>{category.categoryName}</Text>
              </View>
            )
          )}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            padding: 12,
            borderRadius: 10,
            width: "100%",
            alignItems: "center",
            marginBottom: 5,
          }}
          onPress={() => {
            // Navigate to recipe detail endpoint
            const recipeId = recipe.id || (recipe as any)._id;
            if (recipeId) {
              router.push(`/recipe/${recipeId}` as any);
            }
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            View Recipe
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Recipe;
