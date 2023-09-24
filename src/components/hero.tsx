import { Typography } from "@/components/typography";

const Hero = () => (
  <Typography.h1 className="group flex items-center gap-2 hover:lowercase">
    <p className="group-hover:translate-x-[112px] transition-all inline">
      <span className="group-hover:text-transparent">A</span>
      <span className="animate-pulse">nt</span>
      <span className="group-hover:text-muted">ho</span>
      <span className="animate-pulse">n</span>
      <span className="group-hover:text-muted">y&nbsp;</span>
    </p>
    <p className="group-hover:translate-x-[-215px] transition-all inline">
      Cueva
    </p>
  </Typography.h1>
);

export { Hero };
