"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ScheduledScanSchema = new mongoose_1.Schema({
    urlId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'URL',
        required: true
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    ownerId: {
        type: String,
        required: true,
        index: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Time must be in HH:MM format'
        }
    },
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        validate: {
            validator: function (v) {
                if (this.frequency === 'weekly' && (v < 0 || v > 6)) {
                    return false;
                }
                return true;
            },
            message: 'Day of week must be between 0 and 6'
        }
    },
    dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
        validate: {
            validator: function (v) {
                if (this.frequency === 'monthly' && (v < 1 || v > 31)) {
                    return false;
                }
                return true;
            },
            message: 'Day of month must be between 1 and 31'
        }
    },
    scanOptions: {
        gdpr: {
            type: Boolean,
            default: true
        },
        accessibility: {
            type: Boolean,
            default: true
        },
        security: {
            type: Boolean,
            default: true
        },
        performance: {
            type: Boolean,
            default: false
        },
        seo: {
            type: Boolean,
            default: false
        },
        customRules: [{
                type: String
            }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastRun: {
        type: Date
    },
    nextRun: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});
// Index for efficient querying of active scheduled scans
ScheduledScanSchema.index({ isActive: 1, nextRun: 1 });
ScheduledScanSchema.index({ ownerId: 1, isActive: 1 });
// Pre-save middleware to calculate nextRun
ScheduledScanSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('frequency') || this.isModified('time') ||
        this.isModified('dayOfWeek') || this.isModified('dayOfMonth')) {
        this.nextRun = this.calculateNextRun();
    }
    next();
});
// Method to calculate next run time
ScheduledScanSchema.methods.calculateNextRun = function () {
    const now = new Date();
    const [hours, minutes] = this.time.split(':').map(Number);
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    // If the time has passed today, move to next occurrence
    if (nextRun <= now) {
        if (this.frequency === 'daily') {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        else if (this.frequency === 'weekly' && this.dayOfWeek !== undefined) {
            const currentDay = nextRun.getDay();
            const daysToAdd = (this.dayOfWeek - currentDay + 7) % 7;
            nextRun.setDate(nextRun.getDate() + daysToAdd);
        }
        else if (this.frequency === 'monthly' && this.dayOfMonth !== undefined) {
            nextRun.setDate(this.dayOfMonth);
            if (nextRun <= now) {
                nextRun.setMonth(nextRun.getMonth() + 1);
            }
        }
    }
    return nextRun;
};
// Method to update next run time after execution
ScheduledScanSchema.methods.updateNextRun = function () {
    this.lastRun = new Date();
    this.nextRun = this.calculateNextRun();
};
exports.default = mongoose_1.default.model('ScheduledScan', ScheduledScanSchema);
//# sourceMappingURL=ScheduledScan.js.map