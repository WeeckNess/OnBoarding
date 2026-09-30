export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  contractSigned: boolean;
  signatureDate?: string;
  signatureImage?: string;
  avatarUrl?: string;
  buddyId: string;
  managerName: string;
  completedTaskIds: string[];
}

export interface RoadmapTask {
  id: string;
  dueDate?: string;
  dayNumber: number; // 1 to 30
  milestoneId: 'prearrival' | 'j1' | 's1' | 's2' | 'j15' | 'j30';
  title: string;
  description: string;
  estimatedMinutes?: number;
  category: 'admin' | 'tech' | 'team' | 'culture' | 'project';
  actionUrl?: string;
  actionLabel?: string;
}

export interface RoadmapMilestone {
  id: 'prearrival' | 'j1' | 's1' | 's2' | 'j15' | 'j30';
  title: string;
  subtitle: string;
  daysRange: string;
  description: string;
  iconName: string;
}

export interface BuddyInfo {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  slackHandle: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  hobbies: string[];
  seniority: string;
  coffeeAvailability: string;
  meetingLink: string;
  welcomeMessage: string;
  syncRituals: {
    period: string;
    title: string;
    description: string;
  }[];
}

export interface CodexArticle {
  id: string;
  category: 'culture' | 'tools' | 'tech' | 'rituals' | 'benefits';
  title: string;
  summary: string;
  content: string[];
  tags: string[];
  icon: string;
  usefulLinks?: { label: string; url: string }[];
}
