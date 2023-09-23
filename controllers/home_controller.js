const { redirect } = require("express/lib/response");
const Habit = require("../models/habit");

module.exports.home = async function (req, res) {
    // first update habit with current date
    // if current date is not present then add it to the habit
    try {
        await updateHabit();
        const currentDate = new Date();
        const sevenDayAgo = new Date();
        sevenDayAgo.setDate(currentDate.getDate() - 6);

        const habits = await Habit.aggregate([
            {
                $unwind: "$dates",
            },
            {
                $addFields: {
                    startDay: { $dayOfMonth: "$dates.date" },
                    startMonth: { $month: "$dates.date" },
                    startYear: { $year: "$dates.date" },
                    endDay: { $dayOfMonth: currentDate },
                    endMonth: { $month: currentDate },
                    endYear: { $year: currentDate },
                },
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$startYear", "$endYear"] },
                            { $eq: ["$startMonth", "$endMonth"] },
                            {
                                $gte: [
                                    "$startDay",
                                    { $dayOfMonth: sevenDayAgo },
                                ],
                            },
                            {
                                $lte: [
                                    "$startDay",
                                    { $dayOfMonth: currentDate },
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    dates: { $push: "$dates" },
                    createdAt: { $first: "$createdAt" }
                },
            },
            {
                $sort: {
                    createdAt: -1 // Sort by creation date in descending order (newest first)
                }
            },
        ]);

        if (!habits || habits.length === 0) {
            console.log("no habits found!");
            return res.render("home", {
                error: "Please add habits!",
            });
        }

        console.log("Home, habits found!", habits);

        return res.render("home", {
            habits: habits,
            error: false,
        });
    } catch (error) {
        console.log("Error in finding or updating habits!", error);

        return res.render("home", {
            error: "Error in retrieving habits, please try again later!",
        });
    }
    // return res.render("home", {
    //     title: "Home",
    // });
};

// add habit
module.exports.addHabit = (req, res) => {
    const currentDate = new Date();

    // check if habit already exists
    Habit.findOne({ name: req.body.name }).then((habit) => {
        if (habit) {
            return res.redirect("back");
        }

        // initialize all past 7 days date including current date
        var dates = [];
        for (var i = 6; i >= 0; i--) {
            dates.push({
                date: new Date().setDate(currentDate.getDate() - i),
                status: "none",
            });
        }
        // habit not fount, create habit
        Habit.create({
            name: req.body.name,
            dates: dates,
        }).then((habit) => {
            console.log("habit created!", habit);
            return res.redirect("/");
        });
    });
};

// remove habit
module.exports.removeHabit = (req, res) => {
    const id = req.query.habitID;
    Habit.findByIdAndDelete(id)
        .then((habit) => {
            console.log("Habit deleted!", habit);
            return res.redirect("/");
        })
        .catch((error) => {
            console.log("error in deleting the habit!", error);
            return res.redirect("back");
        });
};

// update status of the habit
module.exports.changeStatus = (req, res) => {
    const habitID = req.query.habitID;
    const dateID = req.query.dateID;
    const newStatus = req.query.status;
    console.log(habitID, dateID, newStatus);
    Habit.findById(habitID)
        .then((habit) => {
            if (!habit) {
                console.log("habit not found!");
                return res.redirect("back");
            }
            const date = habit.dates.id(dateID);

            if (!date) {
                console.log("date not found!");
                return res.redirect("back");
            }
            date.status = newStatus;
            habit.save()
                .then(() => {
                    console.log("status changed!");
                    return res.redirect("/");
                })
                .catch((error) => {
                    console.log("error while changing the status", error);
                    return res.redirect("back");
                });
        })
        .catch((error) => {
            console.log(
                "error while finding habit to change the status",
                error
            );
            return res.redirect("back");
        });
};

// update habits with current date
const updateHabit = async () => {
    try {
        const currentDate = new Date();
        const habits = await Habit.find().exec();
        console.log("update");
        for (const habit of habits) {
            const isCurrentDatePresent = habit.dates.some((dateObj) => {
                return (
                    dateObj.date.toISOString().split("T")[0] ===
                    currentDate.toISOString().split("T")[0]
                );
            });

            if (!isCurrentDatePresent) {
                habit.dates.push({ date: currentDate, status: "none" });
                await habit.save();
                console.log("Habit updated successfully!");
            }
        }
    } catch (error) {
        console.log("Error while updating habit!", error);
    }
};
