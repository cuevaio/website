import * as React from "react";

interface AsideProps extends React.HTMLProps<HTMLElement> {
  emoji?: string;
}

const Aside = ({
  children,
  emoji = "👋",
  ...props
}: AsideProps): React.ReactNode => {
  return (
    <aside
      {...props}
      className="relative bg-gradient-to-r dark:from-lime-900 dark:to-green-900 from-lime-100 to-green-100 p-4 rounded-lg mt-8 mb-4"
    >
      <div className="absolute w-10 h-10 -top-4 -left-4 flex items-center justify-center text-xl rounded-full dark:bg-lime-900 bg-lime-100">
        {emoji}
      </div>
      <p className="text-md sm:text-lg leading-7">
        {/* @ts-ignore */}
        {children?.props?.children || ""}
      </p>
    </aside>
  );
};

export { Aside };
