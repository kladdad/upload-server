import path from "path";

export default function getExtension(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === "") {
    return "";
  } else {
    return extension.substring(1);
  }
}
