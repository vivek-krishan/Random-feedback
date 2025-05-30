import mongoose, { Document } from 'mongoose';

interface AnswerI extends Document {
    answers: string[];
    questionPaper: mongoose.Schema.Types.ObjectId;
    test: mongoose.Schema.Types.ObjectId;
    student: mongoose.Schema.Types.ObjectId;
    score: {
        grade?: string;
        explanation?: string;
    };
}

const answerSchema = new mongoose.Schema<AnswerI>(
    {
        answers: [
            {
                type: String,
                required: true,
                validate: {
                    validator: function (v: string) {
                        return v.trim() !== '';
                    },
                    message: 'Answer cannot be empty',
                },
            },
        ],
        questionPaper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuestionSetModel',
            required: true,
        },
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestModel',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserModel',
            required: true,
        },

        score: {
            grade: {
                type: String,
            },
            explanation: {
                type: String,
            },
        },
    },
    {
        timestamps: true,
    }
);
const AnswerModel =
    (mongoose.models.AnswerModel as mongoose.Model<AnswerI>) ||
    mongoose.model<AnswerI>('AnswerModel', answerSchema);
export default AnswerModel;
