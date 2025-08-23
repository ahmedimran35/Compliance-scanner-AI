import mongoose, { Document } from 'mongoose';
export interface IURL extends Document {
    projectId: mongoose.Types.ObjectId;
    url: string;
    name?: string;
    status?: 'pending' | 'scanning' | 'completed' | 'failed';
    lastScanned?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IURL, {}, {}, {}, mongoose.Document<unknown, {}, IURL, {}, {}> & IURL & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=URL.d.ts.map