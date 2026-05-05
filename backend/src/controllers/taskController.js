const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const isProjectMember = (project, userId) => {
  return project.members.some((memberId) => memberId.toString() === userId.toString());
};

const ensureProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "admin" && !isProjectMember(project, user._id)) {
    const error = new Error("Forbidden: you are not a project member");
    error.statusCode = 403;
    throw error;
  }

  return project;
};

const createTask = asyncHandler(async (req, res) => {
  const { assignedTo, description, dueDate, priority, project: projectId, title } = req.body;

  const project = await ensureProjectAccess(projectId, req.user);
  const assignee = await User.findById(assignedTo);

  if (!assignee) {
    res.status(404);
    throw new Error("Assigned user not found");
  }

  if (!isProjectMember(project, assignee._id)) {
    res.status(400);
    throw new Error("Assigned user must be a project member");
  }

  const task = await Task.create({
    assignedTo,
    createdBy: req.user._id,
    description,
    dueDate,
    priority,
    project: projectId,
    title
  });

  const populatedTask = await Task.findById(task._id)
    .populate("project", "name")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  res.status(201).json({ task: populatedTask });
});

const getTasks = asyncHandler(async (req, res) => {
  const { project, status, assignedTo, overdue } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (project) filter.project = project;
  if (overdue === "true") {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: "done" };
  }

  if (req.user.role !== "admin") {
    const memberProjects = await Project.find({ members: req.user._id }).select("_id");
    const memberProjectIds = memberProjects.map((item) => item._id);

    filter.project = project
      ? {
          $in: memberProjectIds.filter((projectId) => projectId.toString() === project)
        }
      : { $in: memberProjectIds };
  }

  const tasks = await Task.find(filter)
    .populate("project", "name")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ dueDate: 1 });

  res.json({ tasks });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("project", "name members owner")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (req.user.role !== "admin" && !isProjectMember(task.project, req.user._id)) {
    res.status(403);
    throw new Error("Forbidden: you cannot access this task");
  }

  res.json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await ensureProjectAccess(task.project, req.user);
  const isAssignee = task.assignedTo.toString() === req.user._id.toString();

  if (req.user.role !== "admin" && !isAssignee) {
    res.status(403);
    throw new Error("Only admins or the assignee can update this task");
  }

  if (req.user.role === "member") {
    task.status = req.body.status ?? task.status;
  } else {
    const { assignedTo, description, dueDate, priority, status, title } = req.body;

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        res.status(404);
        throw new Error("Assigned user not found");
      }
      if (!isProjectMember(project, assignee._id)) {
        res.status(400);
        throw new Error("Assigned user must be a project member");
      }
      task.assignedTo = assignedTo;
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;
  }

  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate("project", "name")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  res.json({ task: populatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

module.exports = {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
};
