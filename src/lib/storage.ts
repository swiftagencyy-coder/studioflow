import { slugify } from "@/lib/utils";

export function buildStoragePath({
  agencyId,
  bucket,
  clientId,
  fileName,
  projectId,
  visibility
}: {
  agencyId: string;
  bucket: "project-assets" | "deliverables" | "onboarding-files";
  clientId: string;
  fileName: string;
  projectId: string;
  visibility: "client" | "internal";
}) {
  const safeName = slugify(fileName.replace(/\.[^.]+$/, ""));
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const token = crypto.randomUUID();

  return `${agencyId}/${projectId}/${clientId}/${visibility}/${bucket}-${safeName}-${token}${extension}`;
}
