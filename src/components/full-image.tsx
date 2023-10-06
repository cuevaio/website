import * as React from "react";
import Image, { StaticImageData, ImageProps } from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface FullImageProps extends React.HTMLProps<HTMLDivElement> {
  src: string;
  lightSrc?: string;
  link: string;
  alt: string;
}
const FullImage = ({
  src,
  lightSrc,
  alt,
  className,
  ...props
}: FullImageProps) => {
  return (
    <div
      className={cn(
        "my-8 bg-primary-foreground border rounded-lg p-4 relative md:w-[75vw] -translate-x-1/2 left-1/2 overflow-auto",
        className
      )}
      {...props}
    >
      <Image
        width={1920}
        height={1080}
        src={src}
        alt={alt}
        className={cn("rounded-lg h-full w-full", {
          "opacity-0 dark:opacity-100": lightSrc,
        })}
      />
      <div
        style={
          lightSrc
            ? {
                backgroundImage: `url('${lightSrc}')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }
            : {}
        }
        className="dark:opacity-0 opacity-100 absolute rounded-lg top-4 bottom-4 left-4 right-4"
      />
      <Link href={src} className="absolute top-4 bottom-4 left-4 right-4" />
    </div>
  );
};

export { FullImage };
