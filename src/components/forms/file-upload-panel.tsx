"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { saveUploadedFileMetadataAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildStoragePath } from "@/lib/storage";

export function FileUploadPanel({
  agencyId,
  canUploadInternal,
  clientId,
  projectId
}: {
  agencyId: string;
  canUploadInternal: boolean;
  clientId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [bucket, setBucket] = useState<"project-assets" | "deliverables" | "onboarding-files">("project-assets");
  const [category, setCategory] = useState<
    "logo" | "brand_asset" | "document" | "deliverable" | "reference" | "onboarding_asset"
  >("document");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visibility, setVisibility] = useState<"client" | "internal">("client");

  async function handleUpload() {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    setIsUploading(true);
    const supabase = createSupabaseBrowserClient();
    const storagePath = buildStoragePath({
      agencyId,
      bucket,
      clientId,
      fileName: file.name,
      projectId,
      visibility
    });

    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      setIsUploading(false);
      toast.error(uploadError.message);
      return;
    }

    const result = await saveUploadedFileMetadataAction({
      bucket,
      category,
      fileName: file.name,
      mimeType: file.type || undefined,
      projectId,
      sizeBytes: file.size,
      storagePath,
      visibility
    });

    setIsUploading(false);

    if (!result.success) {
      toast.error(result.error ?? "File metadata could not be saved.");
      return;
    }

    toast.success("File uploaded.");
    setFile(null);
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Bucket</Label>
          <Select onValueChange={(value) => setBucket(value as typeof bucket)} value={bucket}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project-assets">Project assets</SelectItem>
              <SelectItem value="deliverables">Deliverables</SelectItem>
              <SelectItem value="onboarding-files">Onboarding files</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(value) => setCategory(value as typeof category)} value={category}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="logo">Logo</SelectItem>
              <SelectItem value="brand_asset">Brand asset</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="deliverable">Deliverable</SelectItem>
              <SelectItem value="reference">Reference</SelectItem>
              <SelectItem value="onboarding_asset">Onboarding asset</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select
            onValueChange={(value) => setVisibility(value as typeof visibility)}
            value={visibility}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client-visible</SelectItem>
              {canUploadInternal ? <SelectItem value="internal">Internal only</SelectItem> : null}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file-input">Choose file</Label>
        <Input
          id="file-input"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>
      <Button disabled={isUploading || !file} type="button" onClick={handleUpload}>
        <Upload className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload file"}
      </Button>
    </div>
  );
}
