require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const { verifyToken } = require("./middleware/verifyToken");

app.use(express.json());
app.use(cors({ origin: [process.env.FRONTEND_URL, "http://localhost:5173"] }));
initializeDatabase();

const User = require("./models/User");
const Project = require("./models/Project");
const Assignment = require("./models/Assignment");

app.get("/", (req, res) => {
  res.send("API is running");
});

//Authentication routes:

//Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    const { password: pser, ...userWithoutPassword } = user._doc;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Get profile details
app.get("/api/auth/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { password, ...userWithoutPassword } = user._doc;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Update profile details
app.post("/api/auth/profile", verifyToken, async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      return res.status(400).json({ msg: "Password cannot be updated here." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Engineers routes:

//Get all engineers
app.get("/api/engineers", async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" });
    res.json(engineers);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Get capacity of engineer by its id
app.get("/api/engineers/:id/capacity", async (req, res) => {
  try {
    const engineer = await User.findById(req.params.id);
    if (!engineer) return res.status(404).json({ msg: "Engineer not found" });

    const assignments = await Assignment.find({ engineerId: engineer._id });
    const totalAllocated = assignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );
    res.json({
      maxCapacity: engineer.maxCapacity,
      availableCapacity: engineer.maxCapacity - totalAllocated,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get all engineers with capacity info included
app.get("/api/engineers/with-capacity", async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" });

    const engineersWithCapacity = await Promise.all(
      engineers.map(async (engineer) => {
        const assignments = await Assignment.find({ engineerId: engineer._id });
        const totalAllocated = assignments.reduce(
          (sum, a) => sum + a.allocationPercentage,
          0
        );

        return {
          _id: engineer._id,
          name: engineer.name,
          email: engineer.email,
          skills: engineer.skills,
          seniority: engineer.seniority,
          maxCapacity: engineer.maxCapacity,
          availableCapacity: engineer.maxCapacity - totalAllocated,
        };
      })
    );

    res.json(engineersWithCapacity);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Projects routes:

//Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Create new Project
app.post("/api/projects", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only managers can create projects." });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
    } = req.body;

    const projectData = {
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
      managerId: req.user.id,
    };

    const newProject = new Project(projectData);
    const savedProject = await newProject.save();

    res.json(savedProject);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Update Project by ID
app.post("/api/projects/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only managers can update projects." });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
    } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Optional: Check if the managerId matches the logged-in manager's id
    if (project.managerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "You can only update your own projects." });
    }

    // Update fields
    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.startDate = startDate ?? project.startDate;
    project.endDate = endDate ?? project.endDate;
    project.requiredSkills = requiredSkills ?? project.requiredSkills;
    project.teamSize = teamSize ?? project.teamSize;
    project.status = status ?? project.status;

    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Get project by id
app.get("/api/projects/:id", verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "managerId",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

//Assignments routes:
// Get all assignments
app.get("/api/assignments", verifyToken, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("projectId")
      .populate("engineerId", "-password");

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get assignments by engineer id
app.get("/api/assignments/me", verifyToken, async (req, res) => {
  try {
    const engineerId = req.user.id;
    const assignments = await Assignment.find({ engineerId }).populate(
      "projectId"
    );
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Create new assignment
app.post("/api/assignments", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only managers can update assignments." });
    }

    const {
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    } = req.body;

    const assignmentData = {
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    };

    const assignment = new Assignment(assignmentData);
    const savedAssignment = await assignment.save();

    res.json(savedAssignment);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Update the assignment details by id
app.post("/api/assignments/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only managers can update assignments." });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// DELETE /api/assignments/:id
app.delete("/api/assignments/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only managers can delete assignments." });
    }

    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!deletedAssignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    res.json({ msg: "Assignment deleted successfully", deletedAssignment });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
