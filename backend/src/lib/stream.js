import {StreamChat} from 'stream-chat';
import dotenv from 'dotenv';

dotenv.config();
// Initialize Stream client
const apikey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
// Basic validation
if(!apikey || !apiSecret){
    console.eroor("Stream API key or secret is missing");
}

const streamClient = StreamChat.getInstance(apikey, apiSecret);
// Create or update a user in Stream
export const upsertStreamUser = async (userData) =>{ // Upsert means update if exists else create
    try{
        await streamClient.upsertUser(userData); 
        return userData;
    }catch(err){
        console.error("Error creating/updating Stream user:", err);
    }
}
//Generate a Stream token for a user
export const generateStreamToken = (userId) => {
    try {
         //ensure userId is valid
         const userIdStr = userId.toString();
         return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);

    }
};