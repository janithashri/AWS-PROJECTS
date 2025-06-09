const AWS = require('aws-sdk');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();


AWS.config.update({
  region: 'us-east-1'  // Change to your region
});

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

app.use(fileUpload({
  createParentPath: true
}));
app.use(express.static('public'));
app.use(express.json());

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

app.post('/upload', async function(req, res) { 
  console.log("Processing authentication request...");
  
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }
    
    const uploadedFile = req.files.facetosearch;
    const uploadPath = path.join(__dirname, 'uploads', uploadedFile.name);
    

    await uploadedFile.mv(uploadPath);
    

    const imageBuffer = fs.readFileSync(uploadPath);
    
    const params = {
      CollectionId: "your_collection_id", 
      Image: {
        Bytes: imageBuffer
      },
      MaxFaces: 1,
      FaceMatchThreshold: 80
    };
    
    const searchResults = await rekognition.searchFacesByImage(params).promise();
    console.log("Search results:", JSON.stringify(searchResults, null, 2));
    
    if (searchResults.FaceMatches && searchResults.FaceMatches.length > 0) {
      const match = searchResults.FaceMatches[0];
      const externalImageId = match.Face.ExternalImageId || 'unknown';
      const loginTime = new Date().toLocaleString();
      const similarity = match.Similarity.toFixed(2);
      
      try {
        const s3Params = {
          Bucket: "your_bucket_name", 
          Key: externalImageId + ".jpg"  
        };
        
        const s3Response = await s3.getObject(s3Params).promise();
        const originalImageBase64 = s3Response.Body.toString('base64');
        const externalImageId = match.Face.ExternalImageId || 'unknown';
        const loginTime = new Date().toLocaleString();
        
        res.json({
          success: true,
          message: 'Authentication successful!',
          externalImageId: externalImageId,
          loginTime: loginTime,
          similarity: similarity,
          originalImage: originalImageBase64
        });
      } catch (s3Error) {
        console.error("Error retrieving image from S3:", s3Error);
        
        res.json({
          success: true,
          message: 'Authentication successful, but original image not found.',
          externalImageId: externalImageId,
          loginTime: loginTime,
          similarity: similarity,
          originalImage: null
        });
      }
    } else {
      res.json({
        success: false,
        message: 'Authentication failed. Not an employee or try again.'
      });
    }
    
    fs.unlinkSync(uploadPath);
    
  } catch (error) {
    console.error("Error processing authentication:", error);
    res.status(500).json({
      success: false,
      message: 'Error processing authentication',
      error: error.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
