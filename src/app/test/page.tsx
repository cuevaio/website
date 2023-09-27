const Page = () => (
  <div className="font-mono">
    <span
      className="border-l-4 border-l-transparent pl-2 pr-6 before:text-right before:inline-block before:w-6 before:mr-5 before:text-primary/20 before:[content:counter(lineNumber)]"
      data-line=""
      style={{ counterIncrement: "lineNumber 2" }}
    >
      <span style={{ color: "#F47067" }}>import</span>
      <span style={{ color: "#ADBAC7" }}>{` {useMDXComponent} `}</span>
      <span style={{ color: "#F47067" }}>from</span>
      <span style={{ color: "#ADBAC7" }}> </span>
      <span style={{ color: "#96D0FF" }}>"next-contentlayer/hooks"</span>
    </span>
  </div>
);

export default Page;
