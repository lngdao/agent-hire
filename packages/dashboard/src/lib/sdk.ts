import { AgentHire } from "@agenthire/sdk";
import { REGISTRY_ADDRESS, ESCROW_ADDRESS, RPC_URL } from "./constants";

let _sdk: AgentHire | null = null;

export function getSDK(): AgentHire {
  if (!_sdk) {
    _sdk = new AgentHire({
      rpcUrl: RPC_URL,
      registryAddress: REGISTRY_ADDRESS,
      escrowAddress: ESCROW_ADDRESS,
    });
  }
  return _sdk;
}
