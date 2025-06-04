// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract MockContractRegistry {
    address public ftsoV2;

    constructor(address _ftsoV2) {
        ftsoV2 = _ftsoV2;
    }

    function getFtsoV2() external view returns (address) {
        return ftsoV2;
    }
}

contract MockFtsoV2 {
    mapping(bytes21 => uint256) private prices;
    mapping(bytes21 => int8) private decimals;
    mapping(bytes21 => uint64) private timestamps;

    function setPrice(
        bytes21 feedId,
        uint256 price,
        int8 decimal,
        uint64 timestamp
    ) external {
        prices[feedId] = price;
        decimals[feedId] = decimal;
        timestamps[feedId] = timestamp;
    }

    function getFeedById(
        bytes21 feedId
    ) external view returns (uint256, int8, uint64) {
        return (prices[feedId], decimals[feedId], timestamps[feedId]);
    }
}
