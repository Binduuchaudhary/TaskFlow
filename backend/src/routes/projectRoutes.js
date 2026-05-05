const express = require("express");
const { body, param } = require("express-validator");
const {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} = require("../controllers/projectController");
const { authorize, protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getProjects)
  .post(
    authorize("admin"),
    [
      body("name").trim().isLength({ min: 2 }).withMessage("Project name is required"),
      body("description").optional().trim().isLength({ max: 1000 }),
      body("memberIds").optional().isArray().withMessage("memberIds must be an array"),
      body("memberIds.*").optional().isMongoId().withMessage("Each member id must be valid"),
      body("dueDate").optional().isISO8601().withMessage("dueDate must be a valid date")
    ],
    validateRequest,
    createProject
  );

router
  .route("/:id")
  .get([param("id").isMongoId()], validateRequest, getProjectById)
  .patch(
    authorize("admin"),
    [
      param("id").isMongoId(),
      body("name").optional().trim().isLength({ min: 2 }),
      body("description").optional().trim().isLength({ max: 1000 }),
      body("memberIds").optional().isArray().withMessage("memberIds must be an array"),
      body("memberIds.*").optional().isMongoId().withMessage("Each member id must be valid"),
      body("dueDate").optional().isISO8601().withMessage("dueDate must be a valid date")
    ],
    validateRequest,
    updateProject
  )
  .delete(authorize("admin"), [param("id").isMongoId()], validateRequest, deleteProject);

module.exports = router;
