import { createContext, useContext, useState, ReactNode } from "react";

export interface Recipe {
  id: string;
  name: string;
  date: string;
  image: string | null;
  title?: string;
  description?: string;
  category_id?: string;
}

interface RecipesContextType {
  myRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([
    { id: "1", name: "Spaghetti Carbonara", date: "2024-01-25", image: null },
    { id: "2", name: "Chicken Tikka Masala", date: "2024-01-23", image: null },
    { id: "3", name: "Banana Bread", date: "2024-01-21", image: null },
    { id: "4", name: "Fish Tacos", date: "2024-01-19", image: null },
  ]);

  const addRecipe = (recipe: Recipe) => {
    setMyRecipes((prev) => [recipe, ...prev]);
  };

  return (
    <RecipesContext.Provider value={{ myRecipes, addRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
}

