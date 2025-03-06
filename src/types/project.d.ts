export interface Project {
  repoFullName: string;
  createdAt: Date;
  updatedAt: Date;
  customDomain: string;
  isDomainVerified: boolean;
  verificationToken: string;
  slug: string;
  userId: string;
}
