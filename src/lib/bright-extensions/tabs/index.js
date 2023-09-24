import { Code } from "bright";
import { TabsRoot, TabsContent, TabsList } from "./tabs";

/** @type {import("bright").BrightProps["TitleBarContent"]} */
function TitleBarComponent(brightProps) {
  const { subProps, title, Tab } = brightProps;

  const titles = subProps?.length
    ? subProps.map((subProp) => subProp.title)
    : [title];

  const childProps = subProps?.length ? subProps : [brightProps];

  return (
    <div className="w-full flex justify-between items-center">
      <TabsList titles={titles}>
        {titles.map((title, i) => (
          <Tab key={title} {...childProps[i]} />
        ))}
      </TabsList>
      <div className="flex space-x-1 pr-4">
        <div className="rounded-full w-2 h-2 right-0 bg-muted-foreground/60"></div>
        <div className="rounded-full w-2 h-2 right-0 bg-muted-foreground/60"></div>
        <div className="rounded-full w-2 h-2 right-0 bg-muted-foreground/60"></div>
      </div>
    </div>
  );
}

/** @type {import("bright").BrightProps["Root"]} */
function Root(brightProps) {
  const { subProps, title } = brightProps;

  const titles = subProps?.length
    ? subProps.map((subProp) => subProp.title)
    : [title];

  return (
    <TabsRoot defaultValue={titles[0]}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
[data-bright-tab][data-state="inactive"]{ 
  --tab-background: var(--inactive-tab-background);
  --tab-color: var(--inactive-tab-color);; 
  --tab-bottom-border: transparent;
  --tab-top-border: transparent;
}`,
        }}
      />
      <Code.Root {...brightProps} />
    </TabsRoot>
  );
}

/** @type {import("bright").BrightProps["Pre"]} */
function Content(brightProps) {
  const { subProps } = brightProps;
  const propsList = subProps?.length ? subProps : [brightProps];
  return (
    <>
      {propsList.map((props) => (
        <TabsContent key={props.title} value={props.title}>
          <Code.Pre {...props} />
        </TabsContent>
      ))}
    </>
  );
}

/** @type {import("bright").Extension} */
export const tabs = {
  name: "tabs",
  Root,
  TitleBarContent: TitleBarComponent,
  Pre: Content,
};
