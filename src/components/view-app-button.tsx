import { Button } from "@/components/ui/button";

const ViewAppButton = ({ href }: { href: string }) => (
  <div className="w-full relative">
    <Button
      variant="secondary"
      size="sm"
      asChild
      className="absolute right-0 -top-16"
    >
      <a href={href}>Ir a la app</a>
    </Button>
  </div>
);

export { ViewAppButton };
