/** @type {import("bright").Extension} */

export const lineNumbers = {
  name: "lineNumbers",
  beforeHighlight: (props, annotations) => {
    if (annotations.length > 0) {
      return { ...props, lineNumbers: true };
    }
  },
};
