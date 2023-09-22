import { Typography } from "@/mdx-components";

const Page = () => (
  <div>
    <Typography.h1>
      <span>
        hola <a href="#hey">mundo <span>jhey!!</span></a>
      </span>{" "}
      <span className="italic">como estań</span>
    </Typography.h1>
  </div>
);

export default Page;
