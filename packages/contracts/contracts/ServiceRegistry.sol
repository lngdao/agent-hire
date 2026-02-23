// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ServiceRegistry {
    struct Service {
        uint256 id;
        address provider;
        string name;
        string description;
        string[] tags;
        uint256 pricePerJob;
        bool active;
        uint256 totalJobs;
        uint256 totalRating;
        uint256 ratingCount;
        uint256 createdAt;
    }

    uint256 public nextServiceId = 1;

    mapping(uint256 => Service) public services;
    mapping(address => uint256[]) public providerServices;
    mapping(string => uint256[]) public tagIndex;

    event ServiceRegistered(uint256 indexed id, address indexed provider, string name, uint256 pricePerJob);
    event ServiceUpdated(uint256 indexed id, string name, uint256 pricePerJob);
    event ServiceDeactivated(uint256 indexed id);

    function registerService(
        string calldata _name,
        string calldata _description,
        string[] calldata _tags,
        uint256 _pricePerJob
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(_tags.length > 0, "At least one tag required");
        require(_pricePerJob > 0, "Price must be > 0");

        uint256 id = nextServiceId++;

        Service storage s = services[id];
        s.id = id;
        s.provider = msg.sender;
        s.name = _name;
        s.description = _description;
        s.tags = _tags;
        s.pricePerJob = _pricePerJob;
        s.active = true;
        s.createdAt = block.timestamp;

        providerServices[msg.sender].push(id);

        for (uint256 i = 0; i < _tags.length; i++) {
            tagIndex[_tags[i]].push(id);
        }

        emit ServiceRegistered(id, msg.sender, _name, _pricePerJob);
        return id;
    }

    function updateService(
        uint256 _id,
        string calldata _name,
        string calldata _description,
        uint256 _pricePerJob
    ) external {
        Service storage s = services[_id];
        require(s.provider == msg.sender, "Not the provider");
        require(s.active, "Service not active");

        s.name = _name;
        s.description = _description;
        s.pricePerJob = _pricePerJob;

        emit ServiceUpdated(_id, _name, _pricePerJob);
    }

    function deactivateService(uint256 _id) external {
        Service storage s = services[_id];
        require(s.provider == msg.sender, "Not the provider");
        require(s.active, "Already inactive");

        s.active = false;
        emit ServiceDeactivated(_id);
    }

    function getService(uint256 _id) external view returns (
        uint256 id,
        address provider,
        string memory name,
        string memory description,
        string[] memory tags,
        uint256 pricePerJob,
        bool active,
        uint256 totalJobs,
        uint256 totalRating,
        uint256 ratingCount,
        uint256 createdAt
    ) {
        Service storage s = services[_id];
        return (s.id, s.provider, s.name, s.description, s.tags, s.pricePerJob, s.active, s.totalJobs, s.totalRating, s.ratingCount, s.createdAt);
    }

    function findByTag(string calldata _tag) external view returns (uint256[] memory) {
        return tagIndex[_tag];
    }

    function getProviderServices(address _provider) external view returns (uint256[] memory) {
        return providerServices[_provider];
    }

    function incrementJobCount(uint256 _id) external {
        services[_id].totalJobs++;
    }

    function addRating(uint256 _id, uint256 _rating) external {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        services[_id].totalRating += _rating;
        services[_id].ratingCount++;
    }

    function getServiceCount() external view returns (uint256) {
        return nextServiceId - 1;
    }
}
