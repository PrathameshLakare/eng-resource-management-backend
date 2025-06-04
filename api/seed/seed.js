require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Assignment = require("../models/Assignment");
const bcrypt = require("bcrypt");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany();
  await Project.deleteMany();
  await Assignment.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  const [manager1, eng1, eng2, eng3, eng4] = await User.create([
    {
      email: "manager@example.com",
      name: "Manager",
      password: hash,
      role: "manager",
    },
    {
      email: "eng1@example.com",
      name: "Alice",
      password: hash,
      role: "engineer",
      skills: ["React", "Node.js"],
      seniority: "mid",
      maxCapacity: 100, // Full-time
    },
    {
      email: "eng2@example.com",
      name: "Bob",
      password: hash,
      role: "engineer",
      skills: ["Python", "Django"],
      seniority: "junior",
      maxCapacity: 50, // Part-time
    },
    {
      email: "eng3@example.com",
      name: "Charlie",
      password: hash,
      role: "engineer",
      skills: ["Java", "Spring"],
      seniority: "senior",
      maxCapacity: 100, // Full-time
    },
    {
      email: "eng4@example.com",
      name: "Diana",
      password: hash,
      role: "engineer",
      skills: ["React", "Python"],
      seniority: "mid",
      maxCapacity: 75, // Part-time
    },
  ]);

  const [project1, project2, project3, project4] = await Project.create([
    {
      name: "Project Alpha",
      description: "Frontend React app",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      requiredSkills: ["React"],
      teamSize: 3,
      status: "active",
      managerId: manager1._id,
    },
    {
      name: "Project Beta",
      description: "Backend API with Django",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Python", "Django"],
      teamSize: 2,
      status: "active",
      managerId: manager1._id,
    },
    {
      name: "Project Gamma",
      description: "Legacy Java system upgrade",
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Java", "Spring"],
      teamSize: 2,
      status: "planning",
      managerId: manager1._id,
    },
    {
      name: "Project Delta",
      description: "Data analysis with Python",
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      requiredSkills: ["Python"],
      teamSize: 1,
      status: "completed",
      managerId: manager1._id,
    },
  ]);

  await Assignment.create([
    {
      engineerId: eng1._id,
      projectId: project1._id,
      allocationPercentage: 80,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      role: "Frontend Developer",
    },
    {
      engineerId: eng2._id,
      projectId: project2._id,
      allocationPercentage: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      role: "Backend Developer",
    },
    {
      engineerId: eng3._id,
      projectId: project3._id,
      allocationPercentage: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      role: "Java Engineer",
    },
    {
      engineerId: eng4._id,
      projectId: project1._id,
      allocationPercentage: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      role: "React Support",
    },
    {
      engineerId: eng4._id,
      projectId: project2._id,
      allocationPercentage: 25,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      role: "Python Support",
    },
    {
      engineerId: eng1._id,
      projectId: project4._id,
      allocationPercentage: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      role: "Part-time Consultant",
    },
    {
      engineerId: eng2._id,
      projectId: project4._id,
      allocationPercentage: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      role: "Part-time Analyst",
    },
  ]);

  console.log("Seeded data");
  process.exit();
}

seed();
