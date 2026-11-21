import { useId } from "react";
import Form from "react-bootstrap/Form";

const FIELD_CONFIG = [
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    maxLength: 255,
  },
  {
    name: "ingredients",
    label: "Ingredients",
    type: "textarea",
    rows: 6,
    required: true,
  },
  {
    name: "instructions",
    label: "Instructions",
    type: "textarea",
    rows: 6,
    required: true,
  },
  {
    name: "cooking_time",
    label: "Cooking Time (minutes, optional)",
    type: "number",
    min: 1,
    step: 1,
  },
  {
    name: "difficulty_level",
    label: "Difficulty Level",
    type: "select",
    options: [
      ["", "Select"],
      ["Easy", "Easy"],
      ["Medium", "Medium"],
      ["Hard", "Hard"],
    ],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: [
      ["", "Select Category"],
      ["Vegetarian", "Vegetarian"],
      ["Vegan", "Vegan"],
      ["Dairy-free", "Dairy-free"],
      ["Gluten-free", "Gluten-free"],
      ["Healthy Meals", "Healthy Meals"],
      ["Quick and Easy", "Quick and Easy"],
    ],
  },
];

function RecipeFormFields({
  recipeData,
  errors = {},
  onChange,
  disabled = false,
}) {
  const formId = useId();

  return (
    <div className="d-flex flex-column gap-3">
      {FIELD_CONFIG.map((field) => {
        const inputId = `${formId}-${field.name}`;
        const errorId = `${inputId}-error`;
        const messages = errors[field.name] || [];
        const hasError = messages.length > 0;

        const sharedProps = {
          id: inputId,
          name: field.name,
          value: recipeData[field.name] ?? "",
          onChange,
          disabled,
          required: Boolean(field.required),
          isInvalid: hasError,
          "aria-describedby": hasError ? errorId : undefined,
        };

        return (
          <Form.Group key={field.name}>
            <Form.Label htmlFor={inputId}>
              {field.label}
              {field.required && (
                <span className="text-danger ms-1" aria-hidden="true">
                  *
                </span>
              )}
            </Form.Label>

            {field.type === "select" ? (
              <Form.Select {...sharedProps}>
                {field.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                {...sharedProps}
                as={field.type === "textarea" ? "textarea" : "input"}
                type={field.type === "textarea" ? undefined : field.type}
                rows={field.rows}
                min={field.min}
                step={field.step}
                maxLength={field.maxLength}
              />
            )}

            {hasError && (
              <Form.Control.Feedback
                id={errorId}
                type="invalid"
                className="d-block"
                role="alert"
              >
                {messages.map((message, index) => (
                  <div key={index}>{message}</div>
                ))}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      })}
    </div>
  );
}

export default RecipeFormFields;
