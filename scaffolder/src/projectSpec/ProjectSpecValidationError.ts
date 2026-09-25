import type {ProjectSpecIssue} from "./projectSpec";

export class ProjectSpecValidationError extends Error {
    readonly issues: readonly ProjectSpecIssue[];

    constructor(issues: readonly ProjectSpecIssue[]) {
        super("Project spec validation failed.");
        this.name = "ProjectSpecValidationError";
        this.issues = issues;
    }
}
