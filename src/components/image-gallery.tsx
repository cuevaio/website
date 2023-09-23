import * as React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Link2Icon, ZoomInIcon } from "@radix-ui/react-icons";

interface ImageGalleryProps extends React.HTMLProps<HTMLDivElement> {
  images: {
    src: StaticImageData;
    alt: string;
    link?: string;
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
        <div
          className="h-full min-w-max relative group rounded-lg overflow-hidden"
          key={i}
        >
          <Image
            src={image.src}
            alt={image.alt}
            className={cn("h-full w-full")}
          />
          <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 right-0 p-4 bg-background/70 flex items-center justify-between border-t hover:bg-background/100 transition-all">
            <p className="grow">{image.alt}</p>
            <div className="flex-0 flex space-x-2 justify-between">
              {image.link && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  asChild
                >
                  <Link href={image.link}>
                    <Link2Icon />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <Link href={image.src.src}>
                  <ZoomInIcon className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { ImageGallery };
