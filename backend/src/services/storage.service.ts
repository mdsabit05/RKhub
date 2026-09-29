import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export interface UploadOptions {
  fileName: string;
  buffer: Buffer;
  folder: string; // e.g. "notes/bca/sem3/dbms"
  mimeType?: string;
}

export interface UploadResult {
  fileUrl: string;
  storageProvider: "local" | "s3" | "r2" | "supabase" | "b2";
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
 * Native Backblaze B2 cloud storage service.
 * Supports direct uploads via Backblaze B2 API using native fetch and SHA1 hashing.
 */
class BackblazeB2StorageService implements IStorageService {
  private keyId: string;
  private applicationKey: string;
  private bucketId: string;
  private bucketName: string;
  private downloadUrlPrefix: string;
  private cachedAuth: {
    apiUrl: string;
    authToken: string;
    downloadUrl: string;
    expiresAt: number;
  } | null = null;

  constructor() {
    this.keyId = process.env.B2_KEY_ID || process.env.S3_ACCESS_KEY_ID || "";
    this.applicationKey = process.env.B2_APPLICATION_KEY || process.env.S3_SECRET_ACCESS_KEY || "";
    this.bucketId = process.env.B2_BUCKET_ID || "9ae01135f428edd8a20e0a1c";
    this.bucketName = process.env.B2_BUCKET_NAME || "RKCITMhub";
    this.downloadUrlPrefix = process.env.B2_DOWNLOAD_URL || "https://f005.backblazeb2.com";
  }

  private async getAuth() {
    if (this.cachedAuth && Date.now() < this.cachedAuth.expiresAt) {
      return this.cachedAuth;
    }

    const credentials = Buffer.from(`${this.keyId}:${this.applicationKey}`).toString("base64");
    const res = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Backblaze B2 authorization failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as any;
    this.cachedAuth = {
      apiUrl: data.apiUrl,
      authToken: data.authorizationToken,
      downloadUrl: data.downloadUrl || this.downloadUrlPrefix,
      expiresAt: Date.now() + 20 * 60 * 60 * 1000, // cache for 20 hours
    };

    return this.cachedAuth;
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    if (!this.keyId || !this.applicationKey) {
      console.warn("[Storage] Backblaze B2 credentials (B2_KEY_ID / B2_APPLICATION_KEY) missing. Falling back to local storage.");
      const fallback = new LocalStorageService();
      return fallback.upload(options);
    }

    const auth = await this.getAuth();

    // Request upload URL from Backblaze B2
    const getUploadUrlRes = await fetch(
      `${auth.apiUrl}/b2api/v3/b2_get_upload_url?bucketId=${this.bucketId}`,
      {
        headers: {
          Authorization: auth.authToken,
        },
      }
    );

    if (!getUploadUrlRes.ok) {
      throw new Error(`Backblaze B2 get_upload_url failed: ${await getUploadUrlRes.text()}`);
    }

    const uploadUrlData = (await getUploadUrlRes.json()) as any;
    const normalizedFolder = options.folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const safeFileName = options.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const b2FileName = `${normalizedFolder}/${Date.now()}-${safeFileName}`;

    // SHA1 hash required by Backblaze B2
    const sha1 = crypto.createHash("sha1").update(options.buffer).digest("hex");

    const uploadRes = await fetch(uploadUrlData.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(b2FileName),
        "Content-Type": options.mimeType || "application/pdf",
        "Content-Length": String(options.buffer.length),
        "X-Bz-Content-Sha1": sha1,
      },
      body: new Uint8Array(options.buffer),
    });

    if (!uploadRes.ok) {
      throw new Error(`Backblaze B2 upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
    }

    // Public URL on Backblaze B2
    const fileUrl = `${auth.downloadUrl}/file/${this.bucketName}/${b2FileName}`;

    return {
      fileUrl,
      storageProvider: "b2",
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
    if (!this.bucket || !this.endpoint) {
      console.warn(
        `[Storage] ${this.providerName.toUpperCase()} credentials not fully configured. Falling back to local storage.`
      );
      const localFallback = new LocalStorageService();
      return localFallback.upload(options);
    }

    const normalizedFolder = options.folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const key = `${normalizedFolder}/${Date.now()}-${options.fileName}`;

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

  if (provider === "b2" || provider === "backblaze") {
    return new BackblazeB2StorageService();
  }

  if (provider === "s3" || provider === "r2" || provider === "supabase") {
    return new S3CompatibleStorageService(provider);
  }

  return new LocalStorageService();
}

export const storageService = getStorageService();
