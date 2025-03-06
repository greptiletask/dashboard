export interface Project {
  repoFullName: string;
  createdAt: Date;
  updatedAt: Date;
  customDomain: string;
  isDomainVerified: boolean;
  slug: string;
  userId: string;
}
