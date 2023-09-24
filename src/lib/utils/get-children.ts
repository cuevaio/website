export function getChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  } else if (Array.isArray(children)) {
    return children.map((child) => getChildren(child)).join("");
  } else if (typeof children === "object") {
    // @ts-ignore
    return getChildren(children.props.children);
  } else {
    return "";
  }
}

export function getIdFromChildren(children: React.ReactNode): string {
  return getChildren(children).replace(/\s/g, "-").toLowerCase();
}
