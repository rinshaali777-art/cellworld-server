
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Get all users and search users
exports.getAllUsers = async (req, res) => {
    try {
        const { search, status } = req.query;

        let filter = {
            role: 'user'
        };

        // Search by name, email or phone
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status && ['Active', 'Blocked'].includes(status)) {
            filter.status = status;
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            count: users.length,
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};


// Get single user details
exports.getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findOne({
            _id: id,
            role: 'user'
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User details fetched successfully',
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user details',
            error: error.message
        });
    }
};


// Block or activate user
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        if (!['Active', 'Blocked'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be Active or Blocked'
            });
        }

        const user = await User.findOneAndUpdate(
            {
                _id: id,
                role: 'user'
            },
            { status },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: `User ${status.toLowerCase()} successfully`,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};


// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findOneAndDelete({
            _id: id,
            role: 'user'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
