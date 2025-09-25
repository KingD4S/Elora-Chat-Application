import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    nativeLanguage: { type: String, default: "" },
    learningLanguage: { type: String, default: "" },
    location: { type: String, default: "" },
    inOnboarded: { type: Boolean, default: false },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
},{ timestamps: true }); // timestamps will create createdAt and updatedAt fields automatically

//pre hook to hash password before saving user
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(err){
        next(err);
    }
});

const User = mongoose.model('User', userSchema);

export default User;