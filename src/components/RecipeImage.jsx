import { useState } from "react";
import placeholder from "../assets/recipe-placeholder.svg";
import styles from "../styles/RecipeImage.module.css";

function RecipeImageContent({
  src,
  alt,
  className,
  loading = "lazy",
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  const isPlaceholder = !src || hasError;

  return (
    <img
      {...props}
      src={isPlaceholder ? placeholder : src}
      alt={isPlaceholder ? `No image available for ${alt}` : alt}
      className={`${styles.RecipeImage} ${className}`.trim()}
      loading={loading}
      decoding="async"
      onError={isPlaceholder ? undefined : () => setHasError(true)}
    />
  );
}

export default function RecipeImage({ src, alt, className, ...props }) {
  // Reset the error state whenever the image source changes.
  return <RecipeImageContent key={src || ""} src={src} alt={alt} {...props} />;
}
