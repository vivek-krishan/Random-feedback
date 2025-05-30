import mongoose, { Schema, Document } from 'mongoose';

// Question Set Interface and Schema
export interface questionSetsI extends Document {
    questions: string[];
}

const questionSetSchema = new Schema<questionSetsI>({
    questions: [
        {
            type: String,
            required: true,
        },
    ],
});

export const QuestionSetModel =
    (mongoose.models.QuestionSetModel as mongoose.Model<questionSetsI>) ||
    mongoose.model<questionSetsI>('QuestionSetModel', questionSetSchema);

// Test Interface and Schema
export interface TestI extends Document {
    title: string;
    topic: string[];
    timing: { start: Date; end: Date };
    teacher: mongoose.Schema.Types.ObjectId;
    sets: questionSetsI[];
    answers: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export const testSchema = new Schema<TestI>(
    {
        title: {
            type: String,
            required: true,
        },

        topic: [
            {
                type: String,
                required: true,
            },
        ],

        timing: {
            start: {
                type: Date,
                required: true,
            },
            end: {
                type: Date,
                required: true,
            },
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TeacherModel',
            required: true,
        },

        sets: [QuestionSetModel],

        answers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'AnswerModel',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const TestModel =
    (mongoose.models.TestModel as mongoose.Model<TestI>) ||
    mongoose.model<TestI>('TestModel', testSchema);
export default TestModel;
