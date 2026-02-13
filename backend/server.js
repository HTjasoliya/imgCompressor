const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || '*' // Allow all by default for easier testing, restrict in prod
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/compress', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { quality, lossless } = req.body;
        const compressionQuality = quality ? parseInt(quality) : 80;
        const isLossless = lossless === 'true';

        let compressedImageBuffer;
        const metadata = await sharp(req.file.buffer).metadata();
        const format = metadata.format;

        if (format === 'jpeg' || format === 'jpg') {
            const options = isLossless
                ? { mozjpeg: true, chromaSubsampling: '4:4:4' }
                : { quality: compressionQuality };

            compressedImageBuffer = await sharp(req.file.buffer)
                .jpeg(options)
                .toBuffer();
        } else if (format === 'png') {
            const options = isLossless
                ? { compressionLevel: 9, palette: false }
                : { quality: compressionQuality };

            compressedImageBuffer = await sharp(req.file.buffer)
                .png(options)
                .toBuffer();
        } else if (format === 'webp') {
            const options = isLossless
                ? { lossless: true }
                : { quality: compressionQuality };

            compressedImageBuffer = await sharp(req.file.buffer)
                .webp(options)
                .toBuffer();
        } else {
            // Default to jpeg if format not supported for specific compression or generic
            compressedImageBuffer = await sharp(req.file.buffer)
                .toFormat('jpeg')
                .jpeg({ quality: compressionQuality })
                .toBuffer();
        }

        // res.set('Content-Type', `image/${format === 'png' ? 'png' : 'jpeg'}`);
        res.set('Content-Type', req.file.mimetype);
        res.send(compressedImageBuffer);

    } catch (error) {
        console.error('Error compressing image:', error);
        res.status(500).send('Error compressing image.');
    }
});

app.get("/", (req, res) => {
    res.send("Image Compressor Backend Running 🚀");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
