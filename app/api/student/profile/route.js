// app/api/student/profile/route.js

import connectMongoDB from "@/lib/mongodb"; 
import Student from "@/models/Student";     
import mongoose from 'mongoose';
import { NextResponse } from "next/server"; 

const getLoggedInUserId = () => {
    return "684d2b371a0cc7367239c2bd"; 
};

export async function GET(request) {
    try {
        // 1. Connect to MongoDB
        await connectMongoDB();
        console.log("MongoDB connected for student profile API.");

        // 2. Get the logged-in user's ID
        const loggedInUserIdString = getLoggedInUserId();

        // 3. Validate the user ID format
        if (!mongoose.Types.ObjectId.isValid(loggedInUserIdString)) {
            console.error("Invalid user ID format detected:", loggedInUserIdString);
            return NextResponse.json({ message: "Invalid user ID format." }, { status: 400 });
        }
        // Convert the string ID to a Mongoose ObjectId
        const loggedInUserId = new mongoose.Types.ObjectId(loggedInUserIdString);

        // Debugging logs - appear in server terminal!
        console.log(`Attempting to find student with userId: ${loggedInUserId.toString()}`);
        console.log(`Type of loggedInUserId in query: ${typeof loggedInUserId} (and it's a Mongoose ObjectId instance)`);

        // 4. Find the student profile using the userId
        const student = await Student.findOne({ userId: loggedInUserId });

        // Debugging log - if a student was found
        console.log(`Result of Student.findOne: ${student ? 'Student found' : 'Student NOT found'}`);

        // 5. Handle case where student profile is not found
        if (!student) {
            console.log(`Student profile not found for userId: ${loggedInUserIdString}`);
            return NextResponse.json({ message: "Student profile not found." }, { status: 404 });
        }

        // 6. If student is found, return their data
        const studentData = student.toObject(); // Convert Mongoose document to a plain JavaScript object
        console.log("Student profile fetched successfully.");
        return NextResponse.json({ student: studentData }, { status: 200 });

    } catch (error) {
        // 7. Handle any unexpected errors during the process
        console.error("Error fetching student profile:", error);
        // Return a 500 Internal Server Error response
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
}