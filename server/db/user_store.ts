import crypto from 'crypto';
import { UserProfile, ProjectTask, ProjectMilestone } from '../../src/types/index.js';

interface UserRecord extends UserProfile {
  passwordHash: string;
  salt: string;
}

class UserStore {
  private users: Map<string, UserRecord> = new Map();
  private sessions: Map<string, string> = new Map(); // token -> userId
  private tasks: Map<string, ProjectTask> = new Map();
  private milestones: Map<string, ProjectMilestone> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  private seedDefaults() {
    // Seed default admin user
    const saltAdmin = crypto.randomBytes(16).toString('hex');
    const hashAdmin = this.hashPassword('Password123!', saltAdmin);
    const adminUser: UserRecord = {
      id: 'usr-admin-1',
      email: 'admin@codedna.io',
      name: 'Prakash Naidu',
      role: 'Architect',
      passwordHash: hashAdmin,
      salt: saltAdmin,
      createdAt: new Date().toISOString()
    };
    this.users.set(adminUser.email.toLowerCase(), adminUser);

    // Seed default dev user
    const saltDev = crypto.randomBytes(16).toString('hex');
    const hashDev = this.hashPassword('Password123!', saltDev);
    const devUser: UserRecord = {
      id: 'usr-marcus-2',
      email: 'marcus@codedna.io',
      name: 'Marcus Vance',
      role: 'Senior Engineer',
      passwordHash: hashDev,
      salt: saltDev,
      createdAt: new Date().toISOString()
    };
    this.users.set(devUser.email.toLowerCase(), devUser);

    // Seed default tasks
    const t1: ProjectTask = {
      id: 'task-101',
      repositoryId: 'repo-payment-service',
      title: 'Mitigate Retry Amplification Storm',
      description: 'Lower MAX_RETRIES from 5 to 3 and add exponential jittered backoff to Stripe gateway wrapper.',
      status: 'Completed',
      priority: 'P0',
      assignee: 'Marcus Vance',
      dueDate: '2023-10-15',
      createdAt: '2023-10-12',
      linkedArtifacts: ['PR #421', 'Issue #193', 'a81d0f2']
    };

    const t2: ProjectTask = {
      id: 'task-102',
      repositoryId: 'repo-payment-service',
      title: 'Circuit Breaker Integration',
      description: 'Implement pybreaker pattern on upstream webhook handlers during 5xx spikes.',
      status: 'In Progress',
      priority: 'P1',
      assignee: 'Elena Rostova',
      dueDate: '2023-10-28',
      createdAt: '2023-10-14',
      linkedArtifacts: ['Issue #193']
    };

    const t3: ProjectTask = {
      id: 'task-103',
      repositoryId: 'repo-facebook-react',
      title: 'Fiber Concurrent Mode Rollout',
      description: 'Benchmark async fiber reconciler performance against stack reconciler in large trees.',
      status: 'In Review',
      priority: 'P0',
      assignee: 'acdlite',
      dueDate: '2016-10-01',
      createdAt: '2016-09-01',
      linkedArtifacts: ['PR #8900']
    };

    [t1, t2, t3].forEach((t) => this.tasks.set(t.id, t));

    // Seed default milestones
    const m1: ProjectMilestone = {
      id: 'ms-1',
      repositoryId: 'repo-payment-service',
      title: 'Gateway Resilience & Retry Hardening',
      targetDate: '2023-11-01',
      status: 'In Progress',
      progressPercentage: 85,
      description: 'Hardening retry logic and webhook gateway fault tolerance after Incident #193.',
      associatedTaskIds: ['task-101', 'task-102']
    };

    const m2: ProjectMilestone = {
      id: 'ms-2',
      repositoryId: 'repo-facebook-react',
      title: 'React 16 Fiber Core Reconciler',
      targetDate: '2017-09-26',
      status: 'Achieved',
      progressPercentage: 100,
      description: 'Complete overhaul of React rendering engine to Fiber architecture.',
      associatedTaskIds: ['task-103']
    };

    [m1, m2].forEach((m) => this.milestones.set(m.id, m));
  }

  public signup(email: string, password: string, name: string, role?: any): { user: UserProfile; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      throw new Error('User account already exists with this email.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);
    const id = `usr-${Date.now()}`;

    const userRecord: UserRecord = {
      id,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: role || 'Senior Engineer',
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    this.users.set(cleanEmail, userRecord);

    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, id);

    const { passwordHash: _, salt: __, ...profile } = userRecord;
    return { user: profile, token };
  }

  public login(email: string, password: string): { user: UserProfile; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const userRecord = this.users.get(cleanEmail);

    if (!userRecord) {
      throw new Error('Invalid email or password.');
    }

    const hashCheck = this.hashPassword(password, userRecord.salt);
    if (hashCheck !== userRecord.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, userRecord.id);

    const { passwordHash: _, salt: __, ...profile } = userRecord;
    return { user: profile, token };
  }

  public getUserByToken(token: string): UserProfile | null {
    const userId = this.sessions.get(token);
    if (!userId) return null;

    for (const record of this.users.values()) {
      if (record.id === userId) {
        const { passwordHash: _, salt: __, ...profile } = record;
        return profile;
      }
    }
    return null;
  }

  public logout(token: string) {
    this.sessions.delete(token);
  }

  // Tasks & Milestones helpers
  public getTasks(repoId?: string): ProjectTask[] {
    const list = Array.from(this.tasks.values());
    if (repoId) return list.filter((t) => t.repositoryId === repoId);
    return list;
  }

  public addTask(task: ProjectTask): ProjectTask {
    this.tasks.set(task.id, task);
    return task;
  }

  public getMilestones(repoId?: string): ProjectMilestone[] {
    const list = Array.from(this.milestones.values());
    if (repoId) return list.filter((m) => m.repositoryId === repoId);
    return list;
  }
}

export const userStore = new UserStore();
