const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
    {
        // habit name should be unique so that
        // same habit is not added twice
        name: {
            type: String,
            require: true,
            unique: true,
        },
        dates: [
            {
                date: {
                    type: Date,
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["none", "done", "not-done"],
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Habit = mongoose.model('habit', habitSchema);

module.exports = Habit;