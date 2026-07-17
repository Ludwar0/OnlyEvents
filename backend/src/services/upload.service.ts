// @ts-nocheck – multer-s3 types not installed; suppress TS errors for optional S3 upload service
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { env } from '../config/env';

const s3 = new AWS.S3({
  accessKeyId: env.AWS_ACCESS_KEY,
  secretAccessKey: env.AWS_SECRET_KEY,
  region: env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: env.AWS_BUCKET || 'default-bucket',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.') as any, false);
    }
  }
});

export const uploadImage = upload.single('image');
export const uploadImages = upload.array('images', 5);
