import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";
import { generalRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { sanitizeInputMiddleware, validatePagination } from "../middleware/validation.middleware.js";
import { createIssue } from "../controllers/issueControllers/issue.contoller.js";
import { ListIssues  } from "../controllers/issueControllers/issue.contoller.js";
import upload from "../middleware/multer.middleware.js";

import {
    createProject,
    addMemberTOproject,
    ListALLMembersofProject,
    removeMemberFromProject,
    getProjectDetails,
    changeMemberRole,
    getUserProjects,
} from "../controllers/project.controller.js";

const Projectrouter = Router();

// Apply input sanitization and rate limiting to all routes
Projectrouter.use(sanitizeInputMiddleware);
Projectrouter.use(generalRateLimiter);

// All project routes require authentication
Projectrouter.use(verifyToken);

// Project management routes
Projectrouter.route("/create-Project").post(createProject);
Projectrouter.route("/user-projects").get(validatePagination, getUserProjects);
Projectrouter.route("/get-ProjectDetails/:projectId").get(validateProjectId, getProjectDetails);

// Member management routes (require project creator/leader authorization)
Projectrouter.route("/add-Member").post(projectCreatorAuthorization, addMemberTOproject);
Projectrouter.route("/list-Members/:projectId").get(projectMemberAuthorization, validatePagination, ListALLMembersofProject);
Projectrouter.route("/remove-Member").post(projectCreatorAuthorization, removeMemberFromProject);
Projectrouter.route("/change-member-role/:memberId").post(projectLeaderAuthorization, changeMemberRole);

// Issue routes within projects
Projectrouter.route("/:projectId/issues").post(validateProjectId, projectMemberAuthorization, upload.array('attachments'), createIssue);
Projectrouter.route("/:projectId/list-Issues").get(validateProjectId, projectMemberAuthorization, validatePagination, ListIssues);

export { Projectrouter };