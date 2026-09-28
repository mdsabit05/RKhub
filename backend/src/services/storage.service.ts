import fs from "node:fs/promises";
import path from "node:path";

export interface UploadOptions {
  fileName: string;
  buffer: Buffer;
  folder: string; // e.g. "notes/bca/sem3/dbms"
  mimeType?: string;
}

export interface UploadResult {
  fileUrl: string;
  storageProvider: "local" | "s3" | "r2" | "supabase";
}

export interface IStorageService {
  upload(options: UploadOptions): Promise<UploadResult>;
}

class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.resolve(process.cwd(), "public", "pdfs");
  }

  private async nextAvailableFilePath(targetPath: string): Promise<string> {
    let finalPath = targetPath;
    let index = 1;

    while (true) {
      try {
        await fs.access(finalPath);
        const ext = path.extname(targetPath);
        const base = path.basename(targetPath, ext);
        const dir = path.dirname(targetPath);
        finalPath = path.join(dir, `${base}-${index}${ext}`);
        index += 1;
      } catch {
        return finalPath;
      }
    }
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    const targetDir = path.join(this.baseDir, options.folder);
    await fs.mkdir(targetDir, { recursive: true });

    const initialPath = path.join(targetDir, options.fileName);
    const resolvedPath = await this.nextAvailableFilePath(initialPath);

    await fs.writeFile(resolvedPath, options.buffer);

    const relativeFileName = path.basename(resolvedPath);
    // Convert Windows backslashes to forward slashes for URLs
    const normalizedFolder = options.folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const fileUrl = `/pdfs/${normalizedFolder}/${relativeFileName}`;

    return {
      fileUrl,
      storageProvider: "local",
    };
  }
}

/**
 * Cloud Storage service supporting S3, Cloudflare R2, and Supabase Storage.
 * When configured via environment variables, files are uploaded directly to the cloud bucket.
 */
class S3CompatibleStorageService implements IStorageService {
  private endpoint: string;
  private bucket: string;
  private publicDomain?: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private providerName: "s3" | "r2" | "supabase";

  constructor(providerName: "s3" | "r2" | "supabase" = "s3") {
    this.providerName = providerName;
    this.endpoint = process.env.S3_ENDPOINT || "";
    this.bucket = process.env.S3_BUCKET || "";
    this.publicDomain = process.env.S3_PUBLIC_DOMAIN;
    this.accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
    this.secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    // If credentials or bucket are missing, fallback to local storage
    if (!this.bucket || !this.endpoint) {
      console.warn(
        `[Storage] ${this.providerName.toUpperCase()} credentials not fully configured. Falling back to local storage.`
      );
      const localFallback = new LocalStorageService();
      return localFallback.upload(options);
    }

    const normalizedFolder = options.folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const key = `${normalizedFolder}/${Date.now()}-${options.fileName}`;

    // Standard HTTP PUT to S3-compatible REST API endpoint
    const uploadUrl = `${this.endpoint.replace(/\/$/, "")}/${this.bucket}/${key}`;

    const headers: Record<string, string> = {
      "Content-Type": options.mimeType || "application/pdf",
    };

    if (this.accessKeyId && this.secretAccessKey) {
      headers["Authorization"] = `Bearer ${this.secretAccessKey}`;
    }

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers,
      body: new Uint8Array(options.buffer),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to cloud storage: ${response.status} ${response.statusText}`);
    }

    const publicUrl = this.publicDomain
      ? `${this.publicDomain.replace(/\/$/, "")}/${key}`
      : uploadUrl;

    return {
      fileUrl: publicUrl,
      storageProvider: this.providerName,
    };
  }
}

export function getStorageService(): IStorageService {
  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  if (provider === "s3" || provider === "r2" || provider === "supabase") {
    return new S3CompatibleStorageService(provider);
  }

  return new LocalStorageService();
}

export const storageService = getStorageService();
