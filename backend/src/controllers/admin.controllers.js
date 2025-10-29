import User from "../models/user.model.js";
import Department from "../models/department.model.js";
import Course from "../models/course.model.js";
import College from "../models/college.model.js";

// ----------------------------
// 1. Get all departments for admin's college
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.aggregate([
      { $match: { college_id: req.user.college_id } },
      // Lookup Students
      {
        $lookup: {
          from: "users",
          localField: "students",
          foreignField: "_id",
          as: "studentsList",
        },
      },
      // Lookup Faculty
      {
        $lookup: {
          from: "users",
          localField: "faculty",
          foreignField: "_id",
          as: "facultyList",
        },
      },
      // Lookup Courses
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "department_id",
          as: "coursesList",
        },
      },

      // Project only needed fields + counts
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          totalStudents: { $size: "$studentsList" },
          totalFaculty: { $size: "$facultyList" },
          totalCourses: { $size: "$coursesList" },
        },
      },
    ]);

    res.status(200).json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------------------------
// 2. Get department details (faculty + students)
export const getDepartmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id)
      .populate({ path: "faculty", select: "fullName email role" })
      .populate({ path: "students", select: "fullName email role" })
      .populate({ path: "courses", select: "course_name description" })

    if (!department)
      return res.status(404).json({ message: "Department not found" });

    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// 3. Create department
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Department.findOne({
      name,
      college_id: req.user.college_id,
    });
    if (exists)
      return res.status(400).json({ message: "Department already exists" });

    const department = await Department.create({
      name,
      description,
      college_id: req.user.college_id,
    });

    await College.findByIdAndUpdate(req.user.college_id, {
      $push: { departments: department._id },
    });

    res.status(201).json({ message: "Department created", department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// 4. Create student
export const createStudent = async (req, res) => {
  try {
    const { fullName, email, password, department_id } = req.body;

    const department = await Department.findById(department_id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const student = await User.create({
      fullName,
      email,
      password,
      role: "Student",
      department_id,
      department_name: department.name,
      college_id: req.user.college_id,
    });

    await Department.findByIdAndUpdate(department_id, {
      $push: { students: student._id },
    });

    res.status(201).json({ message: "Student created", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// 5. Create teacher
export const createTeacher = async (req, res) => {
  try {
    const { fullName, email, password, department_id } = req.body;

    const department = await Department.findById(department_id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const teacher = await User.create({
      fullName,
      email,
      password,
      role: "Teacher",
      department_id,
      department_name: department.name,
      college_id: req.user.college_id,
    });

    await Department.findByIdAndUpdate(department_id, {
      $push: { faculty: teacher._id },
    });

    res.status(201).json({ message: "Teacher created", teacher });
  } catch (err) {
    console.log('sdfwe')
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// 6. Create course
export const createCourse = async (req, res) => {
  try {
    const { course_name, description, department_id, faculty_id } = req.body;

    const department = await Department.findById(department_id);
    if (!department) return res.status(404).json({ message: "Department not found" });

    const faculty = await User.findById(faculty_id);
    if (!faculty || faculty.role !== "Teacher")
      return res.status(400).json({ message: "Invalid faculty" });

    const course = await Course.create({
      course_name,
      description,
      department_id,
      college_id: req.user.college_id,
      faculty_id,
    });

    await Department.findByIdAndUpdate(department_id, {
      $push: { courses: course._id },
    });

    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// 7. Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findById(id);
    if (!student || student.role !== "Student")
      return res.status(404).json({ message: "Student not found" });

    await Department.findByIdAndUpdate(student.department_id, {
      $pull: { students: student._id },
    });

    await User.findByIdAndDelete(id); // ✅ Updated
    res.status(200).json({ message: "Student removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// 8. Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== "Teacher")
      return res.status(404).json({ message: "Teacher not found" });

    await Department.findByIdAndUpdate(teacher.department_id, {
      $pull: { faculty: teacher._id },
    });

    await User.findByIdAndDelete(id); // ✅ Updated
    res.status(200).json({ message: "Teacher removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

