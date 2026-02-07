import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";
import { issueExistAuthorization } from "../middleware/issueHandlingmiddlewares/issueExistAuthorization.middleware.js";
import { authorizeIssueAccess } from "../middleware/issueHandlingmiddlewares/issueAcess.middleware.js";
import { assigneeAuthorization } from "../middleware/issueHandlingmiddlewares/assigneeAuthorization.middleware.js";
import { generalRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { sanitizeInputMiddleware } from "../middleware/validation.middleware.js";
import {
    DeleteIssue,
    GetIssue,
    UpdateIssue,
} from "../controllers/issueControllers/issue.contoller.js";
 
import {
   assignIssueTOUser, reassignIssue, unassignIssue
} from "../controllers/issueControllers/issueAssign.controller.js";

const issueRouter = Router();

// Apply security middleware to all routes
issueRouter.use(sanitizeInputMiddleware);
issueRouter.use(generalRateLimiter);
issueRouter.use(verifyToken); // All issue routes require authentication

// Issue CRUD operations
issueRouter.route("/get-Issue/:issueId").get(
    issueExistAuthorization, 
    projectMemberAuthorization, 
    GetIssue
);

issueRouter.route("/update-Issue/:issueId").put(
    issueExistAuthorization,
    authorizeIssueAccess, 
    UpdateIssue
);

issueRouter.route("/delete-Issue/:issueId").delete(
    issueExistAuthorization,
    projectLeaderAuthorization, 
    DeleteIssue
);

// Issue assignment operations (require project leader authorization)
issueRouter.route("/assign-issue/:issueId").post(
    issueExistAuthorization, 
    assigneeAuthorization, 
    projectLeaderAuthorization, 
    assignIssueTOUser
);

issueRouter.route("/reassign-issue/:issueId").post(
    issueExistAuthorization, 
    assigneeAuthorization, 
    projectLeaderAuthorization, 
    reassignIssue
);

issueRouter.route("/unassign-issue/:issueId").post(
    issueExistAuthorization, 
    projectLeaderAuthorization, 
    unassignIssue
);

export { issueRouter };