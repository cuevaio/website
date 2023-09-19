const Hero = () => (
  <h1 className="text-primary text-4xl font-bold grow mb-6 mr-24 group flex items-center gap-2 hover:lowercase cursor-pointer">
    <div className="group-hover:translate-x-[84px] transition-all">
      <span className="group-hover:text-transparent">A</span>
      <span className="animate-pulse">
        nt
      </span>
      <span className="group-hover:text-muted">ho</span>
      <span className="animate-pulse">n</span>
      <span className="group-hover:text-muted">y</span>
    </div>
    <div className="group-hover:translate-x-[-154px] transition-all">
      Cueva
    </div>
  </h1>
);

export { Hero };
