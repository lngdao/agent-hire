import { ethers } from "ethers";
import { SERVICE_REGISTRY_ABI, JOB_ESCROW_ABI } from "./abi";
import {
  AgentHireConfig,
  Service,
  Job,
  JobStatus,
  ServiceConfig,
  FindOptions,
} from "./types";

export class AgentHire {
  public provider: ethers.JsonRpcProvider;
  public signer: ethers.Wallet | null;
  public registry: ethers.Contract;
  public escrow: ethers.Contract;
  public readOnly: boolean;

  constructor(config: AgentHireConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
      this.readOnly = false;
    } else {
      this.signer = null;
      this.readOnly = true;
    }

    const signerOrProvider = this.signer || this.provider;
    this.registry = new ethers.Contract(
      config.registryAddress,
      SERVICE_REGISTRY_ABI,
      signerOrProvider
    );
    this.escrow = new ethers.Contract(
      config.escrowAddress,
      JOB_ESCROW_ABI,
      signerOrProvider
    );
  }

  // ─── Provider Methods ───

  async register(config: ServiceConfig): Promise<number> {
    this._requireSigner();
    const price = ethers.parseEther(config.pricePerJob);
    const tx = await this.registry.registerService(
      config.name,
      config.description,
      config.tags,
      price
    );
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.registry.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === "ServiceRegistered");
    return Number(event!.args.id);
  }

  async submitResult(jobId: number, result: string): Promise<void> {
    this._requireSigner();
    const tx = await this.escrow.submitResult(jobId, result);
    await tx.wait();
  }

  onJobCreated(
    callback: (
      jobId: number,
      serviceId: number,
      consumer: string,
      provider: string,
      amount: bigint,
      task: string
    ) => void
  ): ethers.Contract {
    const providerAddress = this.signer?.address;
    this.escrow.on(
      "JobCreated",
      (
        id: bigint,
        serviceId: bigint,
        consumer: string,
        provider: string,
        amount: bigint,
        task: string
      ) => {
        if (
          !providerAddress ||
          provider.toLowerCase() === providerAddress.toLowerCase()
        ) {
          callback(
            Number(id),
            Number(serviceId),
            consumer,
            provider,
            amount,
            task
          );
        }
      }
    );
    return this.escrow;
  }

  // ─── Consumer Methods ───

  async find(options: FindOptions = {}): Promise<Service[]> {
    const { tags, maxPrice, sortBy = "rating" } = options;
    const serviceCount = Number(await this.registry.getServiceCount());
    const allServices: Service[] = [];

    if (tags && tags.length > 0) {
      const seenIds = new Set<number>();
      for (const tag of tags) {
        const ids: bigint[] = await this.registry.findByTag(tag);
        for (const id of ids) {
          const numId = Number(id);
          if (!seenIds.has(numId)) {
            seenIds.add(numId);
            const service = await this._getServiceById(numId);
            if (service && service.active) {
              allServices.push(service);
            }
          }
        }
      }
    } else {
      for (let i = 1; i <= serviceCount; i++) {
        const service = await this._getServiceById(i);
        if (service && service.active) {
          allServices.push(service);
        }
      }
    }

    // Filter by maxPrice
    let filtered = allServices;
    if (maxPrice) {
      const max = ethers.parseEther(maxPrice);
      filtered = filtered.filter((s) => s.pricePerJob <= max);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.avgRating - a.avgRating;
        case "price":
          return Number(a.pricePerJob - b.pricePerJob);
        case "volume":
          return b.totalJobs - a.totalJobs;
        default:
          return b.avgRating - a.avgRating;
      }
    });

    return filtered;
  }

  async hire(serviceId: number, taskDescription: string): Promise<number> {
    this._requireSigner();
    const service = await this._getServiceById(serviceId);
    if (!service) throw new Error("Service not found");
    if (!service.active) throw new Error("Service not active");

    const tx = await this.escrow.createJob(serviceId, taskDescription, {
      value: service.pricePerJob,
    });
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.escrow.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === "JobCreated");
    return Number(event!.args.id);
  }

  async confirmComplete(jobId: number): Promise<void> {
    this._requireSigner();
    const tx = await this.escrow.confirmComplete(jobId);
    await tx.wait();
  }

  async rate(jobId: number, stars: number): Promise<void> {
    this._requireSigner();
    const tx = await this.escrow.rateJob(jobId, stars);
    await tx.wait();
  }

  // ─── View Methods ───

  async getService(id: number): Promise<Service | null> {
    return this._getServiceById(id);
  }

  async getJob(id: number): Promise<Job | null> {
    return this._getJobById(id);
  }

  async getAllServices(): Promise<Service[]> {
    const count = Number(await this.registry.getServiceCount());
    const services: Service[] = [];
    for (let i = 1; i <= count; i++) {
      const s = await this._getServiceById(i);
      if (s) services.push(s);
    }
    return services;
  }

  async getAllJobs(): Promise<Job[]> {
    const count = Number(await this.escrow.getJobCount());
    const jobs: Job[] = [];
    for (let i = 1; i <= count; i++) {
      const j = await this._getJobById(i);
      if (j) jobs.push(j);
    }
    return jobs;
  }

  getAddress(): string | null {
    return this.signer?.address || null;
  }

  // ─── Event Listeners (Dashboard) ───

  onServiceRegistered(
    callback: (
      id: number,
      provider: string,
      name: string,
      price: bigint
    ) => void
  ): void {
    this.registry.on(
      "ServiceRegistered",
      (id: bigint, provider: string, name: string, price: bigint) => {
        callback(Number(id), provider, name, price);
      }
    );
  }

  onJobEvent(
    callback: (eventName: string, jobId: number, data: any) => void
  ): void {
    this.escrow.on(
      "JobCreated",
      (
        id: bigint,
        serviceId: bigint,
        consumer: string,
        provider: string,
        amount: bigint,
        task: string
      ) => {
        callback("JobCreated", Number(id), {
          serviceId: Number(serviceId),
          consumer,
          provider,
          amount,
          task,
        });
      }
    );

    this.escrow.on("ResultSubmitted", (id: bigint, result: string) => {
      callback("ResultSubmitted", Number(id), { result });
    });

    this.escrow.on("JobCompleted", (id: bigint, amount: bigint) => {
      callback("JobCompleted", Number(id), { amount });
    });

    this.escrow.on("JobCancelled", (id: bigint, cancelledBy: string) => {
      callback("JobCancelled", Number(id), { cancelledBy });
    });

    this.escrow.on("JobRated", (id: bigint, rating: bigint) => {
      callback("JobRated", Number(id), { rating: Number(rating) });
    });
  }

  removeAllListeners(): void {
    this.registry.removeAllListeners();
    this.escrow.removeAllListeners();
  }

  // ─── Internal ───

  private _requireSigner(): void {
    if (!this.signer) {
      throw new Error(
        "Signer required for this operation. Provide a privateKey in config."
      );
    }
  }

  private async _getServiceById(id: number): Promise<Service | null> {
    try {
      const s = await this.registry.getService(id);
      if (Number(s.id) === 0) return null;
      const ratingCount = Number(s.ratingCount);
      return {
        id: Number(s.id),
        provider: s.provider,
        name: s.name,
        description: s.description,
        tags: [...s.tags],
        pricePerJob: s.pricePerJob,
        active: s.active,
        totalJobs: Number(s.totalJobs),
        totalRating: Number(s.totalRating),
        ratingCount,
        avgRating: ratingCount > 0 ? Number(s.totalRating) / ratingCount : 0,
        createdAt: Number(s.createdAt),
      };
    } catch {
      return null;
    }
  }

  private async _getJobById(id: number): Promise<Job | null> {
    try {
      const j = await this.escrow.getJob(id);
      if (Number(j.id) === 0) return null;
      return {
        id: Number(j.id),
        serviceId: Number(j.serviceId),
        consumer: j.consumer,
        provider: j.provider,
        amount: j.amount,
        taskDescription: j.taskDescription,
        result: j.result,
        status: Number(j.status) as JobStatus,
        rating: Number(j.rating),
        createdAt: Number(j.createdAt),
        submittedAt: Number(j.submittedAt),
        completedAt: Number(j.completedAt),
      };
    } catch {
      return null;
    }
  }
}

export { AgentHireConfig, Service, Job, JobStatus, ServiceConfig, FindOptions } from "./types";
export { SERVICE_REGISTRY_ABI, JOB_ESCROW_ABI } from "./abi";
