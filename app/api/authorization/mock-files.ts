export interface GoogleDriveFile {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  lastModified: string;
  owner: string;
  permissions: string[];
}

export const ALL_FILES: GoogleDriveFile[] = [
  {
    id: "1",
    name: "Project Proposal.docx",
    type: "file",
    size: "2.3 MB",
    lastModified: "2024-01-15T10:30:00Z",
    owner: "john.doe@company.com",
    permissions: ["read", "write"],
  },
  {
    id: "2",
    name: "Budget Spreadsheet.xlsx",
    type: "file",
    size: "1.8 MB",
    lastModified: "2024-01-14T14:20:00Z",
    owner: "jane.smith@company.com",
    permissions: ["read"],
  },
  {
    id: "3",
    name: "Confidential Reports",
    type: "folder",
    lastModified: "2024-01-13T09:15:00Z",
    owner: "admin@company.com",
    permissions: ["admin-only"],
  },
  {
    id: "4",
    name: "Team Photos",
    type: "folder",
    lastModified: "2024-01-12T16:45:00Z",
    owner: "hr@company.com",
    permissions: ["read"],
  },
  {
    id: "5",
    name: "Salary Information.pdf",
    type: "file",
    size: "856 KB",
    lastModified: "2024-01-11T11:30:00Z",
    owner: "admin@company.com",
    permissions: ["admin-only"],
  },
  {
    id: "6",
    name: "Meeting Notes.txt",
    type: "file",
    size: "45 KB",
    lastModified: "2024-01-10T13:20:00Z",
    owner: "team@company.com",
    permissions: ["read"],
  },
  {
    id: "7",
    name: "Company Handbook.pdf",
    type: "file",
    size: "3.2 MB",
    lastModified: "2024-01-09T08:15:00Z",
    owner: "hr@company.com",
    permissions: ["read"],
  },
  {
    id: "8",
    name: "Financial Reports",
    type: "folder",
    lastModified: "2024-01-08T17:30:00Z",
    owner: "finance@company.com",
    permissions: ["admin-only"],
  },
];
