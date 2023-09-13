"use client";
import * as Tooltip from "@radix-ui/react-tooltip";

const NavbarButton = ({
  icon,
  toolTip,
  active,
}: {
  icon: any;
  toolTip: string;
  active?: boolean;
}) => {
  return (
    <Tooltip.Provider delayDuration={0} skipDelayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={
              "rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-tl hover:from-blue-700 hover:to-cyan-500 " +
              (active
                ? "from-yellow-400 to-rose-400 text-neutral-900 hover:text-neutral-100"
                : "")
            }
          >
            {icon}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            className="z-20 TooltipContent bg-gradient-to-tl from-blue-900 to-cyan-600 px-4 py-2 rounded-lg font-semibold text-xs"
            sideOffset={5}
          >
            {toolTip}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export { NavbarButton };
