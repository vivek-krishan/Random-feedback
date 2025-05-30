import mongoose, { Schema, Document } from 'mongoose';


export interface UserI extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    allTests?: mongoose.Types.ObjectId[];
    isVerified?: boolean;
    otp?: string;
    otpExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<UserI>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['teacher', 'student'],
        },
        allTests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'TestModel',
            },
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const UserModel =
    (mongoose.models.UserModel as mongoose.Model<UserI>) ||
    mongoose.model<UserI>('UserModel', userSchema);
export default UserModel;
