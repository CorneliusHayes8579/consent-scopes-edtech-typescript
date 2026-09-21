import { ConsentService } from "./consent_service.js";

const service = new ConsentService();
const report = await service.recordLesson({
  learnerId: "learner-42",
  courseId: "biology-101",
  deadline: "2026-10-15T16:00:00.000Z"
});
console.log(JSON.stringify(report, null, 2));
