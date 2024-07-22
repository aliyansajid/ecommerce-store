import mongoose from 'mongoose';

const connect = async () => {
    if (mongoose.connections[0].readyState) return;

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Mongoose connection established");
    } catch (error) {
        console.error("Error connecting to mongoose:", error);
        throw new Error("Error connecting to mongoose");
    }
}

export default connect;