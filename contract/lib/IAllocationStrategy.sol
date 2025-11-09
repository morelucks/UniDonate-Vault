// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



interface IAllocationStrategy {
    function allocateYield(uint256 amount) external;
    function getBeneficiaries() external view returns (address[] memory, uint256[] memory);
}