"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/browser";

console.log("[COMPONENT] BotIconUpload loaded");

const BUCKET_NAME = "bot-icons";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/gif") {
    return "gif";
  }

  return "png";
}

export default function BotIconUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadIcon(file: File) {
    console.log("[COMPONENT] BotIconUpload uploadIcon called:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPG, WEBP, or GIF image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 2MB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        console.error("[COMPONENT] BotIconUpload user error:", userError);
        setError("Please log in again before uploading an icon.");
        return;
      }

      const extension = getFileExtension(file);

      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      console.log("[COMPONENT] BotIconUpload uploading to:", {
        bucket: BUCKET_NAME,
        filePath,
      });

      const { error: uploadError } = await supabaseBrowser.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[COMPONENT] BotIconUpload upload error:", uploadError);
        setError(uploadError.message);
        return;
      }

      const { data } = supabaseBrowser.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log("[COMPONENT] BotIconUpload public URL created:", {
        publicUrl: data.publicUrl,
      });

      onChange(data.publicUrl);
    } catch (uploadError) {
      console.error("[COMPONENT] BotIconUpload unexpected error:", uploadError);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    void uploadIcon(file);

    event.target.value = "";
  }

  function clearIcon() {
    console.log("[COMPONENT] BotIconUpload clearIcon called");

    onChange("");
    setError("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Bot icon preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus size={24} className="text-text-muted" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary px-4 py-2"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus size={16} />
                Upload Icon
              </>
            )}
          </button>

          {value ? (
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-red-300"
              disabled={uploading}
              onClick={clearIcon}
            >
              <Trash2 size={16} />
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-text-muted">
        Upload PNG, JPG, WEBP, or GIF. Maximum size: 2MB.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}