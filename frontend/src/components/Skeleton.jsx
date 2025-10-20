function Skeleton({
  className = "",
  variant = "rectangular",
  animation = "pulse",
}) {
  const baseClasses = "bg-gray-200";

  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
    />
  );
}

export default Skeleton;
