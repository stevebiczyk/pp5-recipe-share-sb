import { useEffect, useId, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import RecipeImage from "./RecipeImage";
import styles from "../styles/RecipeCreateEditForm.module.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export default function RecipeImageUpload({ currentImage = "",
    selectedFile = null,
    onFileChange,
    errors = [],
    disabled = false,
    title = "Recipe",
}) {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const [previewURL, setPreviewURL] = useState("");
    const [localError, setLocalError] = useState("");

    // Manage the temporary URL only while the selected file exists.
    useEffect(() => {
        if (!selectedFile) {
            setPreviewURL("");
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewURL(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [selectedFile]);

    const handleChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

            if (!file.type.startsWith("image/")) {
      setLocalError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setLocalError("The image must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setLocalError("");
    onFileChange(file);
  };

  const handleCancelSelection = () => {
    onFileChange(null);
    setLocalError("");
  };

  const messages = [
    ...(localError ? [localError] : []),
    ...errors,
  ];

  const displayedImage = previewUrl || currentImage;

  return (
    <Form.Group className="text-center">
      <Form.Label
        htmlFor={inputId}
        className="fw-semibold"
      >
        Recipe photograph (optional)
      </Form.Label>

      <div className={styles.ImagePreview}>
        <RecipeImage
          src={displayedImage}
          alt={`${title} preview`}
          loading="eager"
        />
      </div>

      <Form.Control
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        isInvalid={messages.length > 0}
        aria-describedby={
          messages.length ? errorId : undefined
        }
      />

      {selectedFile && (
        <div className="mt-2">
          <span className="d-block small text-muted mb-2">
            Selected: {selectedFile.name}
          </span>

          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={handleCancelSelection}
            disabled={disabled}
          >
            Cancel image change
          </Button>
        </div>
      )}

      <Form.Text className="d-block">
        Upload an image up to 2 MB.
        Maximum dimensions: 4096 × 4096 pixels.
      </Form.Text>

      {messages.length > 0 && (
        <div
          id={errorId}
          className="text-danger small mt-2"
          role="alert"
        >
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      )}
    </Form.Group>
  );
}