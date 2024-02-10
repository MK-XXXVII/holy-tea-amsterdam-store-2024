type LogoIconProps = JSX.IntrinsicElements['img'] & {
  size?: number | string; // You can define size as a number for pixels or a string for other units
};

export function LogoIcon({size = 40, className, ...props}: LogoIconProps) {
  return (
    <img
      src="https://cdn.shopify.com/s/files/1/0614/7227/6730/files/holy-tea-logo.svg?v=1707349642"
      alt="Holy Tea Logo"
      className={className}
      style={{
        width: size, // Use the size prop to set the width, keeping the logo aspect ratio
        height: 'auto', // Automatically adjust height based on the width to maintain aspect ratio
      }}
      {...props}
    />
  );
}
