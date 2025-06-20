import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('File must be a PDF');
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'resumes' },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(
              new InternalServerErrorException('Upload failed with no result'),
            );
          resolve(result);
        },
      );
      upload.end(file.buffer);
    });
  }
}
