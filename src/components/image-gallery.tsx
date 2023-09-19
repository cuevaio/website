import * as React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface ImageGalleryProps extends React.HTMLProps<HTMLDivElement> {
  images: {
    src: StaticImageData;
    alt: string;
  }[];
}

const ImageGallery = ({ images, className, ...props }: ImageGalleryProps) => {
  return (
    <div
      className={cn(
        "h-[75vh] overflow-auto my-8 bg-primary-foreground border rounded-lg p-4 flex gap-4 relative md:w-[75vw] -translate-x-1/2 left-1/2",
        className
      )}
      {...props}
    >
      {images.map((image, i) => (
        <div className="h-full min-w-max relative" key={i}>
          <Image
            src={image.src}
            alt={image.alt}
            className={cn("rounded-lg h-full w-full")}
          />
          <Link
            href={image.src.src}
            className="absolute top-0 bottom-0 left-0 right-0 text-sm text-neutral-900 hover:text-neutral-100"
          />
        </div>
      ))}
    </div>
  );
};

export { ImageGallery };
