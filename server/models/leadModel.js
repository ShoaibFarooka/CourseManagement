const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        }
    },
    { timestamps: true }
);

const Lead = mongoose.model("lead", leadSchema);

module.exports = Lead;