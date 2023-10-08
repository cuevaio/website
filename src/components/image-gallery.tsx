import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Link2Icon, ZoomInIcon } from "@radix-ui/react-icons";

async function importImage(relativePath: string) {
  try {
    const imageFile = await import("../../public" + relativePath);
    return imageFile;
  } catch (error) {
    console.error(`Error importing file "${relativePath}": ${error}`);
    throw error;
  }
}

interface ImageGalleryProps extends React.HTMLProps<HTMLDivElement> {
  images: {
    src: string;
    alt: string;
    link?: string;
  }[];
}

const ImageGallery = async ({
  images,
  className,
  ...props
}: ImageGalleryProps) => {
  let imageFiles = await Promise.all(
    images.map(async (image) => ({
      src: image.src,
      imageFile: await importImage(image.src),
    }))
  );

  return (
    <div
      className={cn(
        "h-[50vh] md:h-[75vh] overflow-auto my-8 bg-primary-foreground border rounded-lg p-4 flex gap-4 relative md:w-[75vw] -translate-x-1/2 left-1/2",
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
            width={1900}
            height={1080}
            src={imageFiles.find((f) => f.src === image.src)?.imageFile}
            alt={image.alt}
            className={cn("h-full w-full")}
          />
          <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 right-0 p-4 bg-background/70 flex items-center justify-between hover:bg-background/100 transition-all">
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
                <Link href={image.src}>
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
