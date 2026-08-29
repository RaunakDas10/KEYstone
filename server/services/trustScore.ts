import { ProjectModel } from '../models/Project';
import { UserModel } from '../models/User';

const isCompletedOnTime = (project: { deadline?: string; completedAt?: string; lastActivityAt?: string }) => {
  if (!project.deadline) return false;
  const completedAt = project.completedAt || project.lastActivityAt;
  const deadline = new Date(`${project.deadline}T23:59:59.999`);
  const completed = new Date(completedAt || '');
  return !Number.isNaN(deadline.getTime()) && !Number.isNaN(completed.getTime()) && completed <= deadline;
};

/**
 * Trust score: 40 for a completed profile, then up to 20 for projects taken,
 * 30 for completed projects, and 10 for on-time completions.
 */
export const recalculateTrustScore = async (freelancerId: string) => {
  const user = await UserModel.findOne({ id: freelancerId });
  if (!user) return null;

  const projects = await ProjectModel.find({ freelancerId });
  const projectsTaken = projects.length;
  const completedProjects = projects.filter((project) => project.status === 'completed');
  const projectsCompleted = completedProjects.length;
  const completedOnTime = completedProjects.filter(isCompletedOnTime).length;

  const completionRate = projectsTaken ? Math.round((projectsCompleted / projectsTaken) * 100) : 0;
  const onTimeRate = projectsCompleted ? Math.round((completedOnTime / projectsCompleted) * 100) : 0;
  const trustScore = Math.min(
    100,
    (user.profileCompleted ? 40 : 0)
      + Math.min(projectsTaken, 10) * 2
      + Math.min(projectsCompleted, 10) * 3
      + Math.min(completedOnTime, 10)
  );

  user.trustScore = trustScore;
  user.projectsCompleted = projectsCompleted;
  user.completionRate = completionRate;
  user.onTimeRate = onTimeRate;
  await user.save();
  return user;
};

/** Ensure accounts created before trust scoring also begin with an unearned score. */
export const initializeTrustScores = async () => {
  await UserModel.updateMany(
    { profileCompleted: { $exists: false } },
    {
      $set: {
        profileCompleted: false,
        trustScore: 0,
        onTimeRate: 0,
        completionRate: 0,
      },
    }
  );
};
