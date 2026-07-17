"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = exports.uploadImage = void 0;
// @ts-nocheck – multer-s3 types not installed; suppress TS errors for optional S3 upload service
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const env_1 = require("../config/env");
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: env_1.env.AWS_ACCESS_KEY,
    secretAccessKey: env_1.env.AWS_SECRET_KEY,
    region: env_1.env.AWS_REGION
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: env_1.env.AWS_BUCKET || 'default-bucket',
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
        }
        else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
});
exports.uploadImage = upload.single('image');
exports.uploadImages = upload.array('images', 5);
