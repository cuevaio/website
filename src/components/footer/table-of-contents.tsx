"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

interface HeadingsTree {
  id: string;
  text: string;
  [key: number]: HeadingsTree;
}

import { usePathname } from "next/navigation";

function addToHeadingsTree(
  path: number[],
  value: HeadingsTree,
  dic: HeadingsTree
) {
  let currentDict = dic;

  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (!currentDict[key]) {
      currentDict[key] = {
        id: "",
        text: "",
      };
    }
    currentDict = currentDict[key];
  }

  let lastDicIndex = 0;
  for (let key in currentDict) {
    if (parseInt(key) > lastDicIndex) {
      lastDicIndex = parseInt(key);
    }
  }

  currentDict[lastDicIndex + 1] = value;

  let newPath = [...path, lastDicIndex + 1];
  return newPath;
}

function renderHeadings(headings: HeadingsTree) {
  const keys = Object.keys(headings).filter(
    (key) => key !== "id" && key !== "text"
  );

  if (keys.length === 0) return null;

  let children = keys.map((key) => {
    let heading = headings[parseInt(key)];
    return (
      <React.Fragment key={heading.id}>
        <li className="my-2 sm:my-3">
          <SheetClose asChild>
            <a
              href={`#${heading.id}`}
              className="font-medium hover:underline"
            >
              {heading.text}
            </a>
          </SheetClose>
        </li>
        {renderHeadings(heading)}
      </React.Fragment>
    );
  });

  return <ol className="px-6">{children}</ol>;
}

function HeadingList({ headings }: { headings: HeadingsTree }) {
  return (
    <ol className="text-md sm:text-lg leading-7">
      <li>
        <SheetClose asChild>
          <a href={`#${headings.id}`} className="font-bold hover:underline">
            {headings.text}
          </a>
        </SheetClose>
      </li>
      {renderHeadings(headings)}
    </ol>
  );
}

const TableOfContents = () => {
  let pathname = usePathname();
  let [headings, setHeadings] = React.useState<HeadingsTree>();

  React.useEffect(() => {
    let h1Element = document.querySelector("h1");
    if (!h1Element) {
      return;
    }

    let headings: HeadingsTree = {
      id: h1Element.id,
      text: h1Element.textContent || "Main title",
    };

    let headingElements = document.querySelectorAll("h2, h3, h4, h5, h6");

    let path: number[] = [];

    for (let i = 0; i < headingElements.length; i++) {
      let headingElement = headingElements[i];
      let level = parseInt(headingElement.tagName[1]);
      path = path.slice(0, level - 2);

      path = addToHeadingsTree(
        path,
        {
          id: headingElement.id,
          text: headingElement.textContent || "",
        },
        headings
      );
    }

    setHeadings(headings);
  }, [pathname]);

  return (
    <Sheet>
      <SheetTrigger className="sticky bottom-0 right-0" asChild>
        <Button variant="secondary">Contents</Button>
      </SheetTrigger>
      <SheetContent>
        <p className="mb-4 text-lg sm:text-xl leading-7 font-bold">
          Table of Contents
        </p>

        {headings && <HeadingList headings={headings} />}
      </SheetContent>
    </Sheet>
  );
};

export { TableOfContents };
