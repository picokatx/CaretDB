export interface MatrixGlobals {
    rrwebEvents: any[];
    consoleLogs: any[];
    networkRequests: any[];
    playerInstance: any;
    currentView: "timeline" | "raw" | "console" | "network";
    selectedEventIndex: number;
    currentLogLevel: string;
    consoleSearchText: string;
    networkSearchText: string;
}
export const matrixGlobals: MatrixGlobals = {
    rrwebEvents: [],
    consoleLogs: [],
    networkRequests: [],
    playerInstance: null,
    currentView: "timeline",
    selectedEventIndex: -1,
    currentLogLevel: "any",
    consoleSearchText: "",
    networkSearchText: "",
};