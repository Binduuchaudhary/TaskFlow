const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} = require("../controllers/taskController");
const { authorize, protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(
    [
      query("project").optional().isMongoId(),
      query("assignedTo").optional().isMongoId(),
      query("status").optional().isIn(["todo", "in-progress", "done"]),
      query("overdue").optional().isBoolean()
    ],
    validateRequest,
    getTasks
  )
  .post(
    authorize("admin"),
    [
      body("title").trim().isLength({ min: 2 }).withMessage("Task title is required"),
      body("description").optional().trim().isLength({ max: 2000 }),
      body("project").isMongoId().withMessage("Valid project id is required"),
      body("assignedTo").isMongoId().withMessage("Valid assignee id is required"),
      body("priority").optional().isIn(["low", "medium", "high"]),
      body("dueDate").isISO8601().withMessage("Valid due date is required")
    ],
    validateRequest,
    createTask
  );

router
  .route("/:id")
  .get([param("id").isMongoId()], validateRequest, getTaskById)
  .patch(
    [
      param("id").isMongoId(),
      body("title").optional().trim().isLength({ min: 2 }),
      body("description").optional().trim().isLength({ max: 2000 }),
      body("assignedTo").optional().isMongoId(),
      body("status").optional().isIn(["todo", "in-progress", "done"]),
      body("priority").optional().isIn(["low", "medium", "high"]),
      body("dueDate").optional().isISO8601()
    ],
    validateRequest,
    updateTask
  )
  .delete(authorize("admin"), [param("id").isMongoId()], validateRequest, deleteTask);

module.exports = router;
