import { User } from "./User";

export interface Issue {
    id: number;
    number: string;
    userId: string;
    title: string;
    description?: string;
    assignee?: User[] | null;
    tag: string[] | null;
    status: IssueStatus;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type IssueStatus = "TO DO" | "IN PROGRESS" | "DONE";
