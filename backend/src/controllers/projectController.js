const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const canAccessProject = (project, user) => {
  if (user.role === "admin") {
    return true;
  }

  return project.members.some((member) => {
    const memberId = member._id || member;
    return memberId.toString() === user._id.toString();
  });
};

const createProject = asyncHandler(async (req, res) => {
  const { description, dueDate, memberIds = [], name } = req.body;

  const validMembers = await User.find({ _id: { $in: memberIds } }).select("_id");
  const members = new Set(validMembers.map((member) => member._id.toString()));
  members.add(req.user._id.toString());

  const project = await Project.create({
    name,
    description,
    dueDate,
    owner: req.user._id,
    members: Array.from(members)
  });

  res.status(201).json({ project });
});

const getProjects = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? {}
      : {
          members: req.user._id
        };

  const projects = await Project.find(filter)
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });

  res.json({ projects });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", "name email role")
    .populate("members", "name email role");

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (!canAccessProject(project, req.user)) {
    res.status(403);
    throw new Error("Forbidden: you are not a project member");
  }

  const tasks = await Task.find({ project: project._id })
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ dueDate: 1 });

  res.json({ project, tasks });
});

const updateProject = asyncHandler(async (req, res) => {
  const { description, dueDate, memberIds, name } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  project.name = name ?? project.name;
  project.description = description ?? project.description;
  project.dueDate = dueDate ?? project.dueDate;

  if (memberIds) {
    const validMembers = await User.find({ _id: { $in: memberIds } }).select("_id");
    const members = new Set(validMembers.map((member) => member._id.toString()));
    members.add(project.owner.toString());
    project.members = Array.from(members);
  }

  await project.save();
  res.json({ project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: "Project and related tasks deleted" });
});

module.exports = {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
};
