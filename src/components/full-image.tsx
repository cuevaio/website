import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Link2Icon, ZoomInIcon } from "@radix-ui/react-icons";

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

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
        "group my-8 bg-primary-foreground border rounded-lg p-4 relative flex items-center justify-center -translate-x-1/2 left-1/2 overflow-auto",
        {
          "h-[75vh] w-max": mobile,
          "max-w-[100%] md:max-w-[75vw] w-max": !mobile,
        },
        className
      )}
      {...props}
    >
      <Image
        width={1080}
        height={1080}
        src={src}
        alt={alt}
        className={cn("rounded-lg w-full h-full", {
          "opacity-0 dark:opacity-100": lightSrc,
        })}
        blurDataURL={rgbDataURL(23, 23, 23)}
        placeholder="blur"
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
      <div className="opacity-0 group-hover:opacity-100 absolute bottom-4 rounded-b-lg left-4 right-4 p-4 bg-background/70 flex items-center justify-between hover:bg-background/100 transition-all">
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
