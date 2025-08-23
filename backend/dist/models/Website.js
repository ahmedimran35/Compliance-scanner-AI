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
const WebsiteSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    url: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    interval: {
        type: String,
        enum: ['1min', '5min', '30min'],
        default: '5min'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastCheck: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'warning'],
        default: 'offline'
    },
    responseTime: {
        type: Number,
        default: 0,
        min: 0
    },
    uptime: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalChecks: {
        type: Number,
        default: 0,
        min: 0
    },
    successfulChecks: {
        type: Number,
        default: 0,
        min: 0
    },
    failedChecks: {
        type: Number,
        default: 0,
        min: 0
    },
    lastDownTime: {
        type: Date
    },
    lastUpTime: {
        type: Date
    }
}, {
    timestamps: true
});
// Index for efficient queries
WebsiteSchema.index({ userId: 1, isActive: 1 });
WebsiteSchema.index({ userId: 1, status: 1 });
WebsiteSchema.index({ lastCheck: 1 });
// Virtual for calculating uptime percentage
WebsiteSchema.virtual('uptimePercentage').get(function () {
    if (this.totalChecks === 0)
        return 0;
    return (this.successfulChecks / this.totalChecks) * 100;
});
// Method to update check results
WebsiteSchema.methods.updateCheckResult = function (isOnline, responseTime) {
    this.lastCheck = new Date();
    this.responseTime = responseTime;
    this.totalChecks += 1;
    if (isOnline) {
        this.successfulChecks += 1;
        this.status = 'online';
        this.lastUpTime = new Date();
    }
    else {
        this.failedChecks += 1;
        this.status = 'offline';
        this.lastDownTime = new Date();
    }
    // Calculate uptime percentage
    this.uptime = (this.successfulChecks / this.totalChecks) * 100;
    return this.save();
};
// Method to set warning status
WebsiteSchema.methods.setWarningStatus = function () {
    this.status = 'warning';
    this.lastCheck = new Date();
    return this.save();
};
exports.default = mongoose_1.default.model('Website', WebsiteSchema);
//# sourceMappingURL=Website.js.map