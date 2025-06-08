// s3.service.ts
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export class S3Service {
    private s3Client: S3Client;
    private bucket: string;
    private region: string; 
    private accessKeyId: string;
    private secretAccessKey: string;

    constructor() {
        this.bucket = process.env.AWS_S3_BUCKET as string;
        this.region = process.env.AWS_REGION as string;
        this.accessKeyId = process.env.AWS_ACCESS_KEY_ID as string;
        this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;
        
        if(!this.bucket || !this.region || !this.accessKeyId || !this.secretAccessKey) {
            throw new Error("AWS S3 configuration is not set");
        }

        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            },
        });
    }

    async uploadFile(
        buffer: Buffer,
        originalName: string,
        options?: {
            folder?: string;
            acl?: 'private' | 'public-read';
            contentType?: string;
            fileName?: string;
        }
    ): Promise<string> {
        const fileExt = extname(originalName);
        const file = options?.fileName || `${randomUUID()}${fileExt}`;
        const folder = options?.folder ? `${options.folder}/` : '';
        const key = `${folder}${file}`;

        const params: PutObjectCommandInput = {
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ACL: options?.acl || 'public-read',
            ContentType: options?.contentType || 'application/octet-stream',
        };

        try {
            await this.s3Client.send(new PutObjectCommand(params));

            const bucket = this.bucket;
            const region = this.region;

            const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

            console.log("✅ Image uploaded successfully:", url);
            return url ;
        } catch (err) {
            throw new Error('File upload failed');
        }
    }
}
