import Image from "next/image";

export function Avatar({
  username,
  src,
  size = "md",
}: {
  username: string;
  src: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const classes = {
    sm: "size-6 text-[0.6rem]",
    md: "size-9 text-xs",
    lg: "size-12 text-sm",
  };
  return src ? (
    <Image
      src={src}
      alt=""
      width={48}
      height={48}
      className={`${classes[size]} rounded-full border-2 border-white object-cover shadow-sm`}
    />
  ) : (
    <span
      className={`${classes[size]} flex items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700`}
    >
      {username.slice(0, 2).toUpperCase()}
    </span>
  );
}
