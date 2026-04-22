const path = require('path');
const fs = require('fs');

// Upload a video file for a course lesson
exports.UploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file provided',
            });
        }

        const userRole = req.user?.role;
        if (userRole !== 'Instructor') {
            // Remove the uploaded file if not authorized
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Only instructors can upload videos',
            });
        }

        // Build the public URL for the uploaded video
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const videoUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;

        console.log('✅ Video uploaded successfully:', req.file.filename);

        return res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            videoUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        });
    } catch (error) {
        console.error('❌ UploadVideo Error:', error);
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error during video upload',
        });
    }
};
