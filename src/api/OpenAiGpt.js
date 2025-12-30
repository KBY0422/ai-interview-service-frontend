import { api } from "./Http.jsx";

export const getJobList = () => api.post("/gpt/interviewJobList");
export const getJobSkill = (e_job) => api.post("/gpt/interviewJobSkill", { e_job });
export const askGPT = (sendValue) => api.post("/gpt/ask", sendValue);
export const writeInterview = (interviewRecords) => api.post("/gpt/writeInterview", interviewRecords);
export const writeSession = (sessionData) => api.post("/gpt/writeSession", sessionData);
export const adminWriteJobList = (jobValues) => api.post("/gpt/adminWriteJobList", jobValues);
export const adminWriteSkillList = (skillValues) => api.post("/gpt/adminWriteSkillList", skillValues);
export const getSkillList = () => api.post("/gpt/adminSkillList");
export const adminDeleteJob = (idx) => api.post("/gpt/adminDeleteJob", { e_job_idx: idx });
export const adminDeleteSkill = (idx) => api.post("/gpt/adminDeleteSkill", { e_skill_idx: idx });
