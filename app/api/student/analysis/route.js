// app/api/student/analysis/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student"; 
import PerformanceRecord from "@/models/PerformanceRecords"; 
import mongoose from 'mongoose';

const getLoggedInUserId = () => {
    return "684d2b371a0cc7367239c2bd"; 
};

export async function GET(request) {
  try {
    await connectMongoDB();
    console.log("MongoDB connected for student analysis API.");

    const loggedInUserIdString = getLoggedInUserId();
    if (!mongoose.Types.ObjectId.isValid(loggedInUserIdString)) {
        return new Response(JSON.stringify({ message: "Invalid user ID format." }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const loggedInUserId = new mongoose.Types.ObjectId(loggedInUserIdString);

    // 1. Find the student linked to the logged-in user
    const student = await Student.findOne({ userId: loggedInUserId });

    if (!student) {
      console.log(`Student not found for userId: ${loggedInUserIdString}`);
      return new Response(JSON.stringify({ message: "Student profile not found. Cannot fetch analysis data." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Find the performance record for that student
    const performanceData = await PerformanceRecord.findOne({ studentId: student._id });

    if (!performanceData) {
      console.log(`Performance data not found for studentId: ${student._id}`);
      return new Response(JSON.stringify({ message: "Performance data not found for this student." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const analysisData = performanceData.toObject();

    console.log("Student analysis data fetched successfully.");
    return new Response(JSON.stringify(analysisData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error fetching student analysis data:", error);
    return new Response(JSON.stringify({ message: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}