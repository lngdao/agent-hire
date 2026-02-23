"use client";
import { useState, useEffect } from "react";
import { Service, Job } from "@agenthire/sdk";
import { getSDK } from "@/lib/sdk";
import { FeedEvent } from "@/components/LiveFeedItem";
import { truncateAddress, formatEth } from "@/lib/utils";

export function useServices(pollInterval = 15000) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        const sdk = getSDK();
        const all = await sdk.getAllServices();
        if (mounted) {
          setServices(all);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
        if (mounted) setLoading(false);
      }
    }

    fetch();
    const interval = setInterval(fetch, pollInterval);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollInterval]);

  return { services, loading };
}

export function useJobs(pollInterval = 15000) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        const sdk = getSDK();
        const all = await sdk.getAllJobs();
        if (mounted) {
          setJobs(all.reverse());
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        if (mounted) setLoading(false);
      }
    }

    fetch();
    const interval = setInterval(fetch, pollInterval);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollInterval]);

  return { jobs, loading };
}

export function useLiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const sdk = getSDK();
    let counter = 0;

    const addEvent = (event: Omit<FeedEvent, "id">) => {
      setEvents((prev) => [
        { ...event, id: `${Date.now()}-${counter++}` },
        ...prev.slice(0, 99),
      ]);
    };

    sdk.onServiceRegistered((id, provider, name, price) => {
      addEvent({
        type: "registered",
        message: `${name} registered by ${truncateAddress(provider)} — ${formatEth(price)}/job`,
        timestamp: Math.floor(Date.now() / 1000),
      });
    });

    sdk.onJobEvent((eventName, jobId, data) => {
      const msgMap: Record<string, string> = {
        JobCreated: `Job #${jobId}: ${truncateAddress(data.consumer)} hired ${truncateAddress(data.provider)} for ${formatEth(data.amount)}`,
        ResultSubmitted: `Job #${jobId}: Result submitted`,
        JobCompleted: `Job #${jobId}: Completed — ${formatEth(data.amount)} released`,
        JobCancelled: `Job #${jobId}: Cancelled by ${truncateAddress(data.cancelledBy)}`,
        JobRated: `Job #${jobId}: Rated ${data.rating}/5 stars`,
      };

      const typeMap: Record<string, FeedEvent["type"]> = {
        JobCreated: "created",
        ResultSubmitted: "submitted",
        JobCompleted: "completed",
        JobCancelled: "cancelled",
        JobRated: "rated",
      };

      addEvent({
        type: typeMap[eventName] || "created",
        message: msgMap[eventName] || `Job #${jobId}: ${eventName}`,
        timestamp: Math.floor(Date.now() / 1000),
        data,
      });
    });

    return () => {
      sdk.removeAllListeners();
    };
  }, []);

  return { events };
}
