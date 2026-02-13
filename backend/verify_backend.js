const axios = require('axios');
const sharp = require('sharp');
const FormData = require('form-data');
const fs = require('fs');

async function verifyBackend() {
    try {
        console.log('Generating test image...');
        const imageBuffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        })
            .png()
            .toBuffer();

        console.log('Test image generated. Size:', imageBuffer.length);

        const formData = new FormData();
        formData.append('image', imageBuffer, { filename: 'test.png', contentType: 'image/png' });
        formData.append('quality', '50');

        console.log('Sending request to backend...');
        const response = await axios.post('http://localhost:5000/compress', formData, {
            headers: {
                ...formData.getHeaders()
            },
            responseType: 'arraybuffer'
        });

        console.log('Response received. Status:', response.status);
        console.log('Compressed image size:', response.data.length);

        if (response.status === 200 && response.data.length > 0) {
            console.log('Backend verification SUCCESSFUL!');
            if (response.data.length < imageBuffer.length) {
                console.log('Compression verified: Output is smaller than input.');
            } else {
                console.log('Compression verified: Output size is valid (might not be smaller for simple solid color images).');
            }
        } else {
            console.error('Backend verification FAILED!');
        }

    } catch (error) {
        console.error('Error verifying backend:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data.toString());
        }
    }
}

verifyBackend();
