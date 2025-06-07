// Simple OTP storage - in production, use Redis or database
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

interface OTPData {
  otp: string;
  expiresAt: number;
  purpose: string;
}

class OTPStore {
  private store = new Map<string, OTPData>();
  private filePath = join(process.cwd(), ".next", "otp-store.json");

  constructor() {
    this.loadFromFile();
    // Clean up expired OTPs on startup
    this.cleanup();
  }

  // Load OTPs from file (for development persistence across hot reloads)
  private loadFromFile(): void {
    try {
      if (existsSync(this.filePath)) {
        const data = readFileSync(this.filePath, "utf8");
        const parsed = JSON.parse(data);
        this.store = new Map(Object.entries(parsed));
        console.log("📁 Loaded OTP store from file");
      }
    } catch {
      console.log("📁 No existing OTP store file found, starting fresh");
    }
  }

  // Save OTPs to file (for development persistence across hot reloads)
  private saveToFile(): void {
    try {
      const data = Object.fromEntries(this.store);
      writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save OTP store to file:", error);
    }
  }

  // Normalize email to lowercase to avoid case sensitivity issues
  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  set(email: string, data: OTPData): void {
    const normalizedEmail = this.normalizeEmail(email);
    console.log(`🔐 Storing OTP for ${normalizedEmail}:`, {
      otp: data.otp,
      purpose: data.purpose,
      expiresAt: new Date(data.expiresAt).toISOString(),
    });
    this.store.set(normalizedEmail, data);
    this.saveToFile();
  }

  get(email: string): OTPData | undefined {
    const normalizedEmail = this.normalizeEmail(email);
    const data = this.store.get(normalizedEmail);

    console.log(`🔍 Looking up OTP for ${normalizedEmail}:`, {
      found: !!data,
      otp: data?.otp,
      purpose: data?.purpose,
      expired: data ? Date.now() > data.expiresAt : null,
      currentTime: new Date().toISOString(),
      expiresAt: data ? new Date(data.expiresAt).toISOString() : null,
    });

    // Clean up expired OTPs
    if (data && Date.now() > data.expiresAt) {
      console.log(`⏰ OTP expired for ${normalizedEmail}, removing...`);
      this.store.delete(normalizedEmail);
      this.saveToFile();
      return undefined;
    }

    return data;
  }

  delete(email: string): boolean {
    const normalizedEmail = this.normalizeEmail(email);
    console.log(`🗑️ Deleting OTP for ${normalizedEmail}`);
    const result = this.store.delete(normalizedEmail);
    this.saveToFile();
    return result;
  }

  // Clean up expired OTPs periodically
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [email, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(email);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
      this.saveToFile();
    }
  }

  // Debug method to see all stored OTPs
  debug(): void {
    console.log("📊 Current OTP Store contents:");
    if (this.store.size === 0) {
      console.log("  (empty)");
    } else {
      for (const [email, data] of this.store.entries()) {
        console.log(
          `  ${email}: ${data.otp} (${data.purpose}) expires ${new Date(
            data.expiresAt
          ).toISOString()}`
        );
      }
    }
  }

  // Clear all OTPs (for testing)
  clear(): void {
    this.store.clear();
    try {
      if (existsSync(this.filePath)) {
        unlinkSync(this.filePath);
      }
    } catch (error) {
      console.error("Failed to delete OTP store file:", error);
    }
    console.log("🧹 Cleared all OTPs");
  }
}

// Create singleton instance
export const otpStore = new OTPStore();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  otpStore.cleanup();
}, 5 * 60 * 1000);

// Function to generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
