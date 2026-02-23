// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ServiceRegistry.sol";

contract JobEscrow {
    enum JobStatus { Created, Submitted, Completed, Cancelled }

    struct Job {
        uint256 id;
        uint256 serviceId;
        address consumer;
        address provider;
        uint256 amount;
        string taskDescription;
        string result;
        JobStatus status;
        uint256 rating;
        uint256 createdAt;
        uint256 submittedAt;
        uint256 completedAt;
    }

    uint256 public constant CONSUMER_CANCEL_TIMEOUT = 1 hours;
    uint256 public constant PROVIDER_CLAIM_TIMEOUT = 24 hours;
    uint256 public constant PROTOCOL_FEE_BPS = 200; // 2% = 200 basis points

    ServiceRegistry public registry;
    address public feeRecipient;
    uint256 public nextJobId = 1;
    uint256 public totalFeesCollected;

    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public consumerJobs;
    mapping(address => uint256[]) public providerJobs;

    event JobCreated(uint256 indexed id, uint256 indexed serviceId, address indexed consumer, address provider, uint256 amount, string taskDescription);
    event ResultSubmitted(uint256 indexed id, string result);
    event JobCompleted(uint256 indexed id, uint256 amount, uint256 fee);
    event JobCancelled(uint256 indexed id, address cancelledBy);
    event JobRated(uint256 indexed id, uint256 rating);

    constructor(address _registry) {
        registry = ServiceRegistry(_registry);
        feeRecipient = msg.sender;
    }

    function createJob(uint256 _serviceId, string calldata _task) external payable returns (uint256) {
        (
            uint256 sId,
            address provider,
            ,,,
            uint256 pricePerJob,
            bool active,
            ,,,
        ) = registry.getService(_serviceId);

        require(sId > 0, "Service not found");
        require(active, "Service not active");
        require(msg.value >= pricePerJob, "Insufficient payment");
        require(msg.sender != provider, "Cannot hire yourself");

        uint256 id = nextJobId++;

        Job storage j = jobs[id];
        j.id = id;
        j.serviceId = _serviceId;
        j.consumer = msg.sender;
        j.provider = provider;
        j.amount = msg.value;
        j.taskDescription = _task;
        j.status = JobStatus.Created;
        j.createdAt = block.timestamp;

        consumerJobs[msg.sender].push(id);
        providerJobs[provider].push(id);

        registry.incrementJobCount(_serviceId);

        emit JobCreated(id, _serviceId, msg.sender, provider, msg.value, _task);
        return id;
    }

    function submitResult(uint256 _jobId, string calldata _result) external {
        Job storage j = jobs[_jobId];
        require(j.provider == msg.sender, "Not the provider");
        require(j.status == JobStatus.Created, "Job not in Created status");

        j.result = _result;
        j.status = JobStatus.Submitted;
        j.submittedAt = block.timestamp;

        emit ResultSubmitted(_jobId, _result);
    }

    function confirmComplete(uint256 _jobId) external {
        Job storage j = jobs[_jobId];
        require(j.consumer == msg.sender, "Not the consumer");
        require(j.status == JobStatus.Submitted, "Job not in Submitted status");

        j.status = JobStatus.Completed;
        j.completedAt = block.timestamp;

        _releasePayout(_jobId);
    }

    function rateJob(uint256 _jobId, uint256 _rating) external {
        Job storage j = jobs[_jobId];
        require(j.consumer == msg.sender, "Not the consumer");
        require(j.status == JobStatus.Completed, "Job not completed");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(j.rating == 0, "Already rated");

        j.rating = _rating;
        registry.addRating(j.serviceId, _rating);

        emit JobRated(_jobId, _rating);
    }

    function cancelJob(uint256 _jobId) external {
        Job storage j = jobs[_jobId];
        require(j.status == JobStatus.Created, "Can only cancel Created jobs");

        if (msg.sender == j.consumer) {
            require(
                block.timestamp >= j.createdAt + CONSUMER_CANCEL_TIMEOUT,
                "Must wait 1 hour to cancel"
            );
        } else if (msg.sender == j.provider) {
            // Provider can cancel anytime
        } else {
            revert("Not consumer or provider");
        }

        j.status = JobStatus.Cancelled;

        (bool sent, ) = payable(j.consumer).call{value: j.amount}("");
        require(sent, "Refund failed");

        emit JobCancelled(_jobId, msg.sender);
    }

    function claimTimeout(uint256 _jobId) external {
        Job storage j = jobs[_jobId];
        require(j.provider == msg.sender, "Not the provider");
        require(j.status == JobStatus.Submitted, "Job not in Submitted status");
        require(
            block.timestamp >= j.submittedAt + PROVIDER_CLAIM_TIMEOUT,
            "Must wait 24 hours to claim"
        );

        j.status = JobStatus.Completed;
        j.completedAt = block.timestamp;

        _releasePayout(_jobId);
    }

    function getJob(uint256 _jobId) external view returns (
        uint256 id,
        uint256 serviceId,
        address consumer,
        address provider,
        uint256 amount,
        string memory taskDescription,
        string memory result,
        JobStatus status,
        uint256 rating,
        uint256 createdAt,
        uint256 submittedAt,
        uint256 completedAt
    ) {
        Job storage j = jobs[_jobId];
        return (j.id, j.serviceId, j.consumer, j.provider, j.amount, j.taskDescription, j.result, j.status, j.rating, j.createdAt, j.submittedAt, j.completedAt);
    }

    function getConsumerJobs(address _consumer) external view returns (uint256[] memory) {
        return consumerJobs[_consumer];
    }

    function getProviderJobs(address _provider) external view returns (uint256[] memory) {
        return providerJobs[_provider];
    }

    function getJobCount() external view returns (uint256) {
        return nextJobId - 1;
    }

    function _releasePayout(uint256 _jobId) internal {
        Job storage j = jobs[_jobId];
        uint256 fee = (j.amount * PROTOCOL_FEE_BPS) / 10000;
        uint256 payout = j.amount - fee;

        (bool sentProvider, ) = payable(j.provider).call{value: payout}("");
        require(sentProvider, "Payment failed");

        if (fee > 0) {
            (bool sentFee, ) = payable(feeRecipient).call{value: fee}("");
            require(sentFee, "Fee transfer failed");
            totalFeesCollected += fee;
        }

        emit JobCompleted(_jobId, payout, fee);
    }
}
