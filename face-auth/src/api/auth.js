const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// AWS config
AWS.config.update({ region: 'us-east-1' });

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// POST /upload
const authenticateUser = async (req, res) => {
  try {
    if (!req.files || !req.files.facetosearch) {
      return res.status(400).json({ success: false, message: 'Image file required' });
    }

    const uploadedFile = req.files.facetosearch;
    const uploadPath = path.join(UPLOAD_DIR, uploadedFile.name);
    await uploadedFile.mv(uploadPath);

    const imageBuffer = fs.readFileSync(uploadPath);

    const searchParams = {
      CollectionId: 'your_collection_id', // Replace with your Rekognition collection
      Image: { Bytes: imageBuffer },
      MaxFaces: 1,
      FaceMatchThreshold: 80
    };

    const result = await rekognition.searchFacesByImage(searchParams).promise();
    const faceMatch = result.FaceMatches?.[0];

    if (faceMatch) {
      const externalImageId = faceMatch.Face.ExternalImageId || 'unknown';
      const similarity = faceMatch.Similarity.toFixed(2);
      const loginTime = new Date().toISOString();

      // Fetch original image from S3
      let originalImageBase64 = null;
      try {
        const s3Response = await s3.getObject({
          Bucket: 'your_bucket_name',
          Key: `${externalImageId}.jpg`
        }).promise();
        originalImageBase64 = s3Response.Body.toString('base64');
      } catch {
        // Image may not exist in S3
      }

      // Optionally log attendance for student
      if (externalImageId.startsWith('student_')) {
        const date = new Date().toISOString().split('T')[0];
        await dynamodb.put({
          TableName: 'StudentAttendance',
          Item: {
            studentId: externalImageId,
            date: date,
            status: 'Present'
          }
        }).promise();
      }

      res.json({
        success: true,
        message: 'Authentication successful',
        externalImageId,
        similarity,
        loginTime,
        originalImage: originalImageBase64
      });
    } else {
      res.json({
        success: false,
        message: 'Authentication failed. Not found in collection.'
      });
    }

    fs.unlinkSync(uploadPath);
  } catch (err) {
    console.error('Error in auth:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { authenticateUser };
