import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect():Promise<void> {
    if (connection.isConnected) {
        return;
    }

   try {
        const db = await mongoose.connect(process.env.MONGO_URI ||"", {});
        //console.log("db: ", db);
        //console.log("db.connections: ", db.connections);
        connection.isConnected = db.connections[0].readyState;
        console.log("Connection to database established");
    }

    catch (error) {
        console.log("Error connecting to database: ", error);
        process.exit(1);
    }
}

export default dbConnect;