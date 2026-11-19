export const validateRecipe = (recipeData) => {
  const errors = {};

  const { title, ingredients, instructions, cooking_time } = recipeData;

  // Validate the required text fields
  if (!title.trim()) {
    errors.title = ["Please enter a title for the recipe."];
  } else if (title.trim().length > 255) {
    errors.title = ["Title must not exceed 255 characters."];
  }

  if (!ingredients.trim()) {
    errors.ingredients = ["Please enter the ingredients for the recipe."];
  }

  if (!instructions.trim()) {
    errors.instructions = ["Please enter the cooking instructions."];
  }

  // Cooking time is optional but must be a positive integer if provided
  if (cooking_time !== "" && cooking_time !== null) {
    const minutes = number(cooking_time);

    if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 2147483647) {
      errors.cooking_time = [
        "Please enter a valid positive whole number of minutes.",
      ];
    }
  }

  return errors;
};

// Construct the multipart payload shared by both forms.
export const buildRecipeFormData = (recipeData, imageFile) => {
  const formData = new FormData();

  formData.append("title", recipeData.title.trim());
  formData.append("ingredients", recipeData.ingredients.trim());
  formData.append("instructions", recipeData.instructions.trim());

  formData.append("cooking_time", recipeData.cooking_time ?? "");

  formData.append("difficulty_level", recipeData.difficulty_level ?? "");

  formData.append("category", recipeData.category ?? "");

  // Only upload an image when a new file has been selected.
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
};
