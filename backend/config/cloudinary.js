import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUD_API_KEY || 'your-cloud-api-key',
  api_secret: process.env.CLOUD_API_SECRET || 'your-cloud-api-secret',
});

export default cloudinary;
