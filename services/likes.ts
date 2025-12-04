import api from "./api";

export interface Like {
  _id?: string;
  id?: string;
  recipe_id: string;
  user_id: string;
  type: "like" | "dislike";
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface LikeQueryParams {
  recipe_id?: string;
  user_id?: string;
  type?: "like" | "dislike";
}

// Get all likes/dislikes
export const getLikes = async (params?: LikeQueryParams): Promise<Like[]> => {
  try {
    const response = await api.get<any>("/api/likes", { params });
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    } else if (data?.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data?.likes && Array.isArray(data.likes)) {
      return data.likes;
    } else {
      return [];
    }
  } catch (error: any) {
    // Handle 404 or missing endpoint gracefully
    if (
      error.response?.status === 404 ||
      error.message?.includes("not found")
    ) {
      return [];
    }
    console.error("Error fetching likes:", error);
    return [];
  }
};

// Get like by ID
export const getLikeById = async (id: string): Promise<Like> => {
  const response = await api.get<Like>(`/api/likes/${id}`);
  return response.data;
};

// Get user's like/dislike for a recipe
export const getUserLikeForRecipe = async (
  recipe_id: string,
  user_id: string
): Promise<Like | null> => {
  try {
    const likes = await getLikes({ recipe_id, user_id });
    return likes.length > 0 ? likes[0] : null;
  } catch (error) {
    console.error("Error fetching user like:", error);
    return null;
  }
};

// Create or update like/dislike
export const createOrUpdateLike = async (data: {
  recipe_id: string;
  user_id: string;
  type: "like" | "dislike";
}): Promise<Like | null> => {
  try {
    // First check if user already has a like/dislike for this recipe
    const existingLike = await getUserLikeForRecipe(
      data.recipe_id,
      data.user_id
    );

    if (existingLike) {
      // If user is clicking the same type, remove it (toggle off)
      if (existingLike.type === data.type) {
        await deleteLike(existingLike._id || existingLike.id || "");
        return null; // Like was removed
      } else {
        // Update to new type
        return await updateLike(existingLike._id || existingLike.id || "", {
          type: data.type,
        });
      }
    } else {
      // Create new like/dislike
      const response = await api.post<Like>("/api/likes", data);
      return response.data;
    }
  } catch (error: any) {
    // Handle 404 or missing endpoint gracefully
    if (
      error.response?.status === 404 ||
      error.message?.includes("not found")
    ) {
      console.warn("Likes endpoint not found, creating like locally");
      // Return a mock response for development
      return {
        recipe_id: data.recipe_id,
        user_id: data.user_id,
        type: data.type,
        id: `temp-${Date.now()}`,
      } as Like;
    }
    console.error("Error creating/updating like:", error);
    throw error;
  }
};

// Update like
export const updateLike = async (
  id: string,
  data: Partial<Like>
): Promise<Like> => {
  const response = await api.put<Like>(`/api/likes/${id}`, data);
  return response.data;
};

// Delete like
export const deleteLike = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/likes/${id}`);
  } catch (error: any) {
    // Handle 404 gracefully
    if (
      error.response?.status === 404 ||
      error.message?.includes("not found")
    ) {
      console.warn("Like endpoint not found, skipping delete");
      return;
    }
    throw error;
  }
};

// Get like/dislike counts for a recipe
export const getRecipeLikeCounts = async (
  recipe_id: string
): Promise<{ likes: number; dislikes: number }> => {
  try {
    const likes = await getLikes({ recipe_id, type: "like" });
    const dislikes = await getLikes({ recipe_id, type: "dislike" });
    return {
      likes: likes.length,
      dislikes: dislikes.length,
    };
  } catch (error) {
    console.error("Error fetching like counts:", error);
    return { likes: 0, dislikes: 0 };
  }
};
