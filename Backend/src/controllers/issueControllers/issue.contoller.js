import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { Project } from "../../models/project.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import mongoose from "mongoose";
import { buildquery } from "../../utils/quirybuilder.js";
import { Issue, IssueHistory, Comment } from "../../models/IsuueSchema/issue.models.js";
import { buildPopulation, applyPopulation } from "../../utils/populationBuilder.js";


const createIssue = asyncHandler(async (req, res) => {
    try {
        const { projectId } = req.params;
        
        console.log('Creating issue for project:', projectId);
        console.log('Request body:', req.body);
        console.log('Files:', req.files);
        console.log('User:', req.user);

        const {
            title,
            description,
            priority = 'medium',
            status = 'open',
            assignedTo,
            assignee
        } = req.body;

        // 🔹 Validate required fields
        if (!title || !title.trim()) {
            throw new ApiError(400, "Title is required");
        }

        if (!description || !description.trim()) {
            throw new ApiError(400, "Description is required");
        }

        // 🔹 Check project exists
        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        console.log('Project found:', project);

        // Check if project has a key, if not generate one
        if (!project.key) {
            const generateProjectKey = (projectName) => {
                return projectName
                    .toUpperCase()
                    .replace(/[^A-Z0-9\s]/g, '')
                    .split(' ')
                    .filter(word => word.length > 0)
                    .map(word => word.substring(0, 2))
                    .join('')
                    .substring(0, 4)
                    .padEnd(4, 'X');
            };
            
            project.key = generateProjectKey(project.name);
            await project.save();
            console.log('Generated project key:', project.key);
        }

        // 🔹 Generate Issue Key (e.g. PROJ-12)
        const issueCount = await Issue.countDocuments({ project: projectId });
        const issueKey = `${project.key}-${issueCount + 1}`;

        console.log('Generated issue key:', issueKey);

        const PRIORITY_MAP = {
            high: 1,
            medium: 2,
            low: 3
        };

        const computedPriorityOrder = PRIORITY_MAP[priority] || 2;

        // 🔹 Create issue
        const issueData = {
            project: projectId,
            key: issueKey,
            title: title.trim(),
            description: description.trim(),
            type: 'task',
            priority,
            priorityOrder: computedPriorityOrder,
            status,
            reporter: req.user._id
        };

        // Add assignee if provided (handle both assignedTo and assignee field names)
        const assigneeId = assignedTo || assignee;
        if (assigneeId && assigneeId.trim()) {
            issueData.assignee = assigneeId;
        }

        // Handle file attachments
        if (req.files && req.files.length > 0) {
            issueData.attachments = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            }));
        }

        console.log('Issue data to create:', issueData);

        const issue = await Issue.create(issueData);
        console.log('Issue created:', issue);

        // Populate the created issue with user details
        const populatedIssue = await Issue.findById(issue._id)
            .populate('reporter', 'name email')
            .populate('assignee', 'name email')
            .populate('project', 'name key');

        console.log('Populated issue:', populatedIssue);

        res.status(201).json(
            new ApiResponse(201, populatedIssue, "Issue created successfully")
        );
    } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
})
const DeleteIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new ApiError(400, "Invalid issueId");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1️⃣ Soft delete main issue
        const issue = await Issue.findOneAndUpdate(
            { _id: issueId, isDeleted: false },
            {
                isDeleted: true,
                deletedBy: req.user._id,
                deletedAt: new Date()
            },
            { new: true, session }
        );

        if (!issue) {
            throw new ApiError(404, "Issue not found or already deleted");
        }

        // 2️⃣ Cascade delete subtasks
        if (issue.type !== "subtask") {
            await Issue.updateMany(
                {
                    parent: issueId,
                    type: "subtask",
                    isDeleted: false
                },
                {
                    isDeleted: true,
                    deletedBy: req.user._id,
                    deletedAt: new Date()
                },
                { session }
            );
        }

        await IssueHistory.insertMany([{
            Issue: issueId,
            action: "DELETE",
            by: req.user._id,
            at: new Date()
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Issue deleted successfully"));

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const GetIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    let query = Issue.findOne({ _id: issueId, isDeleted: { $ne: true } });

    // Apply conditional population based on query params
    const populateParam = req.query.populate;
    if (populateParam) {
        const populateArray = buildPopulation(populateParam);
        query = applyPopulation(query, populateArray);
    } else {
        query = query.populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('parent', 'key title');
    }

    const issue = await query.lean();

    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, issue, "Issue fetched successfully"));
})
const UpdateIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    const allowedUpdates = [
        "title",
        "description",
        "status",
        "priority",
        "dueDate"
    ];

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const issue = await Issue.findOne({
            _id: issueId,
            isDeleted: { $ne: true }
        }).session(session);

        if (!issue) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(404, "Issue not found");
        }

        const updates = {};
        const historyEntries = [];

        allowedUpdates.forEach(field => {
            if (
                req.body[field] !== undefined &&
                req.body[field] !== issue[field]
            ) {
                updates[field] = req.body[field];

                historyEntries.push({
                    action: field === "status" ? "STATUS_CHANGE" : field === "priority" ? "PRIORITY_CHANGE" : "UPDATE",
                    field: field,
                    by: userId,
                    from: issue[field],
                    to: req.body[field],
                    at: new Date()
                });
            }
        });

        if (Object.keys(updates).length === 0) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(400, "No valid changes detected");
        }

        // Add version increment for optimistic locking
        const updatedIssue = await Issue.findByIdAndUpdate(
            issueId,
            {
                $set: updates,
                $inc: { __v: 1 },
               
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );
        await IssueHistory.insertMany(historyEntries.map(entry => ({
            Issue: issueId,
            ...entry
        })), { session });  

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            data: updatedIssue
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const ListIssues = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, 'Invalid projectId');
    }

    

    // Extract query parameters
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, priority, assignee, type, labels } = req.query;

    // Pagination
    const { page: parsedPage, limit: parsedLimit, skip } = buildquery({ page, limit });

    // Build filter
    const filter = { project: projectId, isDeleted: { $ne: true } }; // Exclude deleted issues

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;
    if (labels) filter.labels = { $in: Array.isArray(labels) ? labels : [labels] };
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { key: { $regex: search, $options: 'i' } }
        ];
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'priorityOrder', 'dueDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Fetch issues and count in parallel
    let issueQuery = Issue.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(parsedLimit);

    // Apply conditional population based on query params
    const populateParam = req.query.populate;
    if (populateParam) {
        const populateArray = buildPopulation(populateParam);
        issueQuery = applyPopulation(issueQuery, populateArray);
    } else {
        issueQuery = issueQuery.populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('parent', 'key title');
    }

    issueQuery = issueQuery.lean();

    const [issues, total] = await Promise.all([
        issueQuery,
        Issue.countDocuments(filter)
    ]);

    // Pagination meta
    const totalPages = Math.ceil(total / parsedLimit);
    const hasNextPage = parsedPage < totalPages;
    const hasPrevPage = parsedPage > 1;

    // Wrap response in ApiResponse utility
    const apiResponse = new ApiResponse(200, {
        data: issues,
        pagination: {
            currentPage: parsedPage,
            totalPages,
            totalIssues: total,
            hasNextPage,
            hasPrevPage,
            limit: parsedLimit
        }
    }, "Issues fetched successfully");

    res.status(apiResponse.statuscode).json(apiResponse);
});

export {
    createIssue,
    DeleteIssue,
    GetIssue,
    UpdateIssue,
    ListIssues
}