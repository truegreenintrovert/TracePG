export default function BrandLogo({
  className = "",
  iconClassName = "h-10 w-10",
  wordmarkClassName = "h-6 w-auto",
}) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <img
        className={`${iconClassName} shrink-0 object-contain`}
        src="/trace-logo-square.png"
        alt=""
        aria-hidden="true"
      />
      <img
        className={`${wordmarkClassName} object-contain`}
        src="/tracepg-wordmark.png"
        alt="TracePG"
      />
    </span>
  );
}
