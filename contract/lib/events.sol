// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Events {
    event YieldHarvested(uint256 amount, uint256 protocolFee, uint256 donated);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event AllocationStrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);
    event EmergencyWithdraw(uint256 amount);
}