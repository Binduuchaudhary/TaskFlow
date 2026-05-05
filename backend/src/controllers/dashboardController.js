const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();

  const projectFilter =
    req.user.role === "admin"
      ? {}
      : {
          members: req.user._id
        };

  const projects = await Project.find(projectFilter).select("_id");
  const projectIds = projects.map((project) => project._id);

  const taskFilter =
    req.user.role === "admin"
      ? {}
      : {
          project: { $in: projectIds }
        };

  const [totalProjects, totalTasks, overdueTasks, byStatus, myTasks] = await Promise.all([
    Project.countDocuments(projectFilter),
    Task.countDocuments(taskFilter),
    Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: "done" }
    }),
    Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),
    Task.countDocuments({ ...taskFilter, assignedTo: req.user._id })
  ]);

  res.json({
    totalProjects,
    totalTasks,
    overdueTasks,
    myTasks,
    byStatus: byStatus.reduce(
      (summary, item) => ({
        ...summary,
        [item._id]: item.count
      }),
      { todo: 0, "in-progress": 0, done: 0 }
    )
  });
});

module.exports = { getDashboard };
