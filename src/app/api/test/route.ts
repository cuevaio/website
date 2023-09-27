import { NextResponse } from "next/server";

import { ReactElementToHast } from "@/lib/utils/reactelement-to-hast";
import { CodeTitle } from "@/components/typography/code-block/title";
export async function GET() {
  try {
    let TestCode = CodeTitle({
      title: "Test Code",
      className: "test-code",
      "data-testid": "test-code",
    });

    return NextResponse.json({
      reactElement: TestCode,
      hast: ReactElementToHast(TestCode),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      reactElement: CodeTitle({
        title: "Test Code",
        className: "test-code",
        "data-testid": "test-code",
      }),
      error,
    });
  }
}
