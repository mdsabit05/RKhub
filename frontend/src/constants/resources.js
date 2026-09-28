import {
  BookOpen,
  FileText,
  GraduationCap,
  Library,
  Search,
} from "lucide-react";

export const resourceMeta = {
  notes: {
    title: "College Notes",
    description: "Access official college notes unit by unit.",
    icon: FileText,
  },
  pyq: {
    title: "Previous Year Questions",
    description: "Browse question papers by semester, subject and unit.",
    icon: Search,
  },
  syllabus: {
    title: "College Syllabus",
    description: "Find the syllabus for your course and subject.",
    icon: GraduationCap,
  },
  reference: {
    title: "Reference Material",
    description: "Find books, PDFs and useful links by unit.",
    icon: Library,
  },
};

export const tones = ["green", "orange", "purple", "pink"];
