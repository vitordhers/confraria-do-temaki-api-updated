import { BadRequestException } from '@nestjs/common';

const fileFilter = (
  req: any,
  file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  },
  callback: (error: Error, acceptFile: boolean) => void,
) => {
  const allowedFormats = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
  const supportedFormat = allowedFormats.includes(file.mimetype);
  if (supportedFormat) {
    return callback(null, true);
  }
  return callback(new BadRequestException('Extension not allowed'), false);
};

export default fileFilter;
