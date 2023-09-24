/** @type {import("bright").Extension} */
export const title = {
  name: "title",
  beforeHighlight: (props, annotations) => {
    if (annotations.length > 0) {
      return { ...props, title: annotations[0].query };
    }
  },
};
