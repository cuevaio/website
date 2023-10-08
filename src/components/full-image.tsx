import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Link2Icon, ZoomInIcon } from "@radix-ui/react-icons";

interface FullImageProps extends React.HTMLProps<HTMLDivElement> {
  src: string;
  lightSrc?: string;
  link: string;
  alt: string;
  mobile?: true;
}

const FullImage = async ({
  src,
  lightSrc,
  alt,
  mobile,
  link,
  className,
  ...props
}: FullImageProps) => {
  return (
    <div
      className={cn(
        "group my-8 bg-primary-foreground border rounded-lg relative -translate-x-1/2 left-1/2",
        {
          "aspect-square w-full": mobile,
          "aspect-video md:w-[75vw] w-full": !mobile,
        },
        className
      )}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("rounded-lg object-contain p-2", {
          "opacity-0 dark:opacity-100": lightSrc,
        })}
      />
      {lightSrc && (
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
      )}
      <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 rounded-b-lg left-0 right-0 p-4 bg-background/70 flex items-center justify-between hover:bg-background/100 transition-all">
        <p className="grow">{alt}</p>
        <div className="flex-0 flex space-x-2 justify-between">
          {link && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              asChild
            >
              <Link href={link}>
                <Link2Icon />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={src}>
              <ZoomInIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export { FullImage };
