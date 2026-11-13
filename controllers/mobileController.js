
const Mobile = require('../models/mobileModel');
const cloudinary = require('../config/cloudinary');



const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'cell-world/mobiles',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(fileBuffer);
    });
};

// Add mobile
exports.addMobile = async (req, res) => {
    try {
        const { phoneName, brand, IMEI, actualPrice } = req.body;

        if (!phoneName || !brand || !IMEI || !actualPrice || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'All fields and mobile image are required'
            });
        }

        if (!/^\d{15}$/.test(IMEI)) {
            return res.status(400).json({
                success: false,
                message: 'IMEI must contain exactly 15 digits'
            });
        }

        if (!Number.isFinite(Number(actualPrice)) || Number(actualPrice) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid price greater than zero'
            });
        }

        const existingMobile = await Mobile.findOne({ IMEI });

        if (existingMobile) {
            return res.status(409).json({
                success: false,
                message: 'Mobile with this IMEI already exists'
            });
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer);

        // Save mobile details in MongoDB
        const newMobile = await Mobile.create({
            phoneName,
            brand,
            IMEI,
            actualPrice: Number(actualPrice),
            image: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
            status: 'Available'
        });

        return res.status(201).json({
            success: true,
            message: 'Mobile added successfully',
            data: newMobile
        });

    } catch (error) {
        console.error('Add mobile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to add mobile',
            error: error.message
        });
    }
};


exports.getAllMobiles = async (req, res) => {
    try {
        const mobiles = await Mobile.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Mobiles fetched successfully',
            data: mobiles
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch mobiles',
            error: error.message
        });
    }
};

exports.getSingleMobile = async (req, res) => {
    try {
        const mobile = await Mobile.findById(req.params.id);

        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mobile details fetched successfully',
            data: mobile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch mobile',
            error: error.message
        });
    }
};



exports.updateMobile = async (req, res) => {
    let newUpload = null;

    try {
        const { id } = req.params;

        const {
            phoneName,
            brand,
            IMEI,
            actualPrice,
            status
        } = req.body;

        // Find existing mobile
        const mobile = await Mobile.findById(id);

        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        // Store old image public ID
        const oldImagePublicId = mobile.imagePublicId;

        // Validate IMEI
        if (IMEI !== undefined && !/^\d{15}$/.test(IMEI)) {
            return res.status(400).json({
                success: false,
                message: 'IMEI must contain exactly 15 digits'
            });
        }

        // Check duplicate IMEI
        if (IMEI && IMEI !== mobile.IMEI) {
            const existingMobile = await Mobile.findOne({
                IMEI,
                _id: { $ne: id }
            });

            if (existingMobile) {
                return res.status(409).json({
                    success: false,
                    message: 'IMEI already exists'
                });
            }
        }

        // Validate price
        if (
            actualPrice !== undefined &&
            (!Number.isFinite(Number(actualPrice)) || Number(actualPrice) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than zero'
            });
        }

        // Validate status
        if (
            status !== undefined &&
            !['Available', 'Sold'].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mobile status'
            });
        }

        // Update mobile details
        if (phoneName !== undefined) {
            mobile.phoneName = phoneName;
        }

        if (brand !== undefined) {
            mobile.brand = brand;
        }

        if (IMEI !== undefined) {
            mobile.IMEI = IMEI;
        }

        if (actualPrice !== undefined) {
            mobile.actualPrice = Number(actualPrice);
        }

        if (status !== undefined) {
            mobile.status = status;
        }

        // Upload new image if provided
        if (req.file) {
            newUpload = await uploadToCloudinary(req.file.buffer);

            mobile.image = newUpload.secure_url;
            mobile.imagePublicId = newUpload.public_id;
        }

        // Save updated mobile in MongoDB
        await mobile.save();

        // Delete old image after successful database update
        if (newUpload && oldImagePublicId) {
            try {
                await cloudinary.uploader.destroy(oldImagePublicId);
            } catch (cloudinaryError) {
                console.error(
                    'Old image deletion failed:',
                    cloudinaryError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Mobile updated successfully',
            data: mobile
        });

    } catch (error) {

        // Delete newly uploaded image if update fails
        if (newUpload) {
            try {
                await cloudinary.uploader.destroy(newUpload.public_id);
            } catch (cloudinaryError) {
                console.error(
                    'New image cleanup failed:',
                    cloudinaryError.message
                );
            }
        }

        console.error('Update mobile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update mobile',
            error: error.message
        });
    }
};




exports.deleteMobile = async (req, res) => {
    try {
        const { id } = req.params;

        // Find mobile
        const mobile = await Mobile.findById(id);

        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        // Delete mobile from MongoDB
        await Mobile.findByIdAndDelete(id);

        // Delete image from Cloudinary
        if (mobile.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(
                    mobile.imagePublicId
                );
            } catch (cloudinaryError) {
                console.error(
                    'Cloudinary deletion failed:',
                    cloudinaryError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Mobile deleted successfully'
        });

    } catch (error) {
        console.error('Delete mobile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete mobile',
            error: error.message
        });
    }
};


exports.searchMobileByIMEI = async (req, res) => {
    try {
        const { imei } = req.params;

        const mobile = await Mobile.findOne({ IMEI: imei });

        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mobile found successfully',
            data: mobile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message
        });
    }
};