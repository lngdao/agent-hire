export interface ServiceConfig {
  name: string;
  description: string;
  tags: string[];
  pricePerJob: string; // ETH amount as string e.g. "0.001"
}

export interface Service {
  id: number;
  provider: string;
  name: string;
  description: string;
  tags: string[];
  pricePerJob: bigint;
  active: boolean;
  totalJobs: number;
  totalRating: number;
  ratingCount: number;
  avgRating: number;
  createdAt: number;
}

export enum JobStatus {
  Created = 0,
  Submitted = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface Job {
  id: number;
  serviceId: number;
  consumer: string;
  provider: string;
  amount: bigint;
  taskDescription: string;
  result: string;
  status: JobStatus;
  rating: number;
  createdAt: number;
  submittedAt: number;
  completedAt: number;
}

export interface FindOptions {
  tags?: string[];
  maxPrice?: string;
  sortBy?: "rating" | "price" | "volume";
}

export interface AgentHireConfig {
  rpcUrl: string;
  privateKey?: string; // optional for read-only mode
  registryAddress: string;
  escrowAddress: string;
}
