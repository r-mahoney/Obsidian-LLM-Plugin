export interface OperatingSystem {
    homedir: () => string;
    platform: () => string;
}

export class MobileOperatingSystem implements OperatingSystem {
    homedir() {
        return "";
    }
    platform() {
        return "";
    }
}

export class DesktopOperatingSystem implements OperatingSystem {
    private os: typeof import("os");
    
    constructor() {
        this.os = require("os");
    }
    
    homedir() {
        return this.os.homedir();
    }
    
    platform() {
        return this.os.platform();
    }
} 