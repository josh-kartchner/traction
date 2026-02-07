import type {
  Project,
  Section,
  Task,
  Comment,
  Attachment,
  TaskStatus,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type { Project, Section, Task, Comment, Attachment, TaskStatus };

// ─── Extended Types with Relations ───────────────────────────────────────────

export type ProjectWithSections = Project & {
  sections: Section[];
};

export type ProjectWithSectionsAndTasks = Project & {
  sections: SectionWithTasks[];
};

export type SectionWithTasks = Section & {
  tasks: Task[];
};

export type TaskWithDetails = Task & {
  comments: Comment[];
  attachments: Attachment[];
};

export type TaskWithSection = Task & {
  section: Section & {
    project: Project;
  };
};

// ─── API Request/Response Types ──────────────────────────────────────────────

// Projects
export interface CreateProjectInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isArchived?: boolean;
}

// Sections
export interface CreateSectionInput {
  projectId: string;
  name: string;
  sortOrder?: number;
}

export interface UpdateSectionInput {
  name?: string;
  sortOrder?: number;
}

// Tasks
export interface CreateTaskInput {
  sectionId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string; // ISO date string
  sortOrder?: number;
}

export interface UpdateTaskInput {
  sectionId?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
  sortOrder?: number;
}

// Comments
export interface CreateCommentInput {
  taskId: string;
  body: string;
}

// Attachments
export interface CreateAttachmentInput {
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// Reorder operations
export interface ReorderItem {
  id: string;
  sortOrder: number;
}

export interface ReorderInput {
  type: "projects" | "sections" | "tasks";
  items: ReorderItem[];
}

// ─── View Types ──────────────────────────────────────────────────────────────

// My Tasks view
export interface MyTasksResponse {
  dueToday: TaskWithSection[];
  upcoming: TaskWithSection[];
}

// Status Report view
export interface StatusReportResponse {
  notStarted: TaskWithSection[];
  inProgress: TaskWithSection[];
  onHold: TaskWithSection[];
  completed: TaskWithSection[];
}

// ─── Status Config ───────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  not_started: {
    label: "Not Started",
    color: "#9CA3AF",
    bgColor: "#F3F4F6",
  },
  in_progress: {
    label: "In Progress",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },
  on_hold: {
    label: "On Hold",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  completed: {
    label: "Completed",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
} as const;

export type StatusKey = keyof typeof STATUS_CONFIG;
