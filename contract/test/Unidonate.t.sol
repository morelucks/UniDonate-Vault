// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {UniDonateVault} from "../src/Unidonate.sol";
import {IYieldStrategy} from "../lib/IYieldStrategy.sol";
import {IAllocationStrategy} from "../lib/IAllocationStrategy.sol";
import {Events} from "../lib/events.sol";

contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initial) ERC20(name, symbol) {
        _mint(msg.sender, initial);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockYieldStrategy is IYieldStrategy {
    IERC20 public immutable asset;
    uint256 public balance;

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    function deposit(uint256 amount) external returns (uint256) {
        // pull from vault
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
        balance += amount;
        return amount;
    }

    function withdraw(uint256 amount) external returns (uint256) {
        require(amount <= balance, "insufficient");
        balance -= amount;
        require(asset.transfer(msg.sender, amount), "transfer failed");
        return amount;
    }

    function harvest() external returns (uint256) {
        // simulate yield generation by minting tokens to caller (vault)
        uint256 yield = 100 ether;
        try MockToken(address(asset)).mint(msg.sender, yield) {
            // minted
        } catch {
            // fallback: no-op if not mintable
        }
        return yield;
    }

    function totalAssets() external view returns (uint256) {
        return balance;
    }
}

contract MockAllocationStrategy is IAllocationStrategy {
    IERC20 public immutable asset;
    uint256 public received;

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    function allocateYield(uint256 amount) external {
        require(asset.transferFrom(msg.sender, address(this), amount), "transfer failed");
        received += amount;
    }

    function getBeneficiaries() external pure returns (address[] memory, uint256[] memory) {
        address[] memory addrs = new address[](0);
        uint256[] memory shares = new uint256[](0);
        return (addrs, shares);
    }
}

contract UniDonateComprehensiveTest is Test {
    MockToken token;
    UniDonateVault vault;
    MockYieldStrategy yieldStrategy;
    MockAllocationStrategy allocationStrategy;

    address user = address(0xBEEF);
    address feeRecipient = address(0xCAFE);

    function setUp() public {
        token = new MockToken("Mock", "MCK", 0);
        // fund test contract
        token.mint(address(this), 1_000_000 ether);

        vault = new UniDonateVault(IERC20(address(token)), "UD Vault", "UDV", feeRecipient);

        yieldStrategy = new MockYieldStrategy(address(token));
        allocationStrategy = new MockAllocationStrategy(address(token));
    }

    function testConstructorRejectsZeroRecipient() public {
        vm.expectRevert(bytes("Invalid fee recipient"));
        new UniDonateVault(IERC20(address(token)), "X", "X", address(0));
    }

    function testDecimalsMatchesAsset() public {
        assertEq(vault.decimals(), token.decimals());
    }

    function testDepositWithoutStrategy() public {
        // give user tokens
        token.mint(user, 100 ether);
        vm.prank(user);
        token.approve(address(vault), 100 ether);

        vm.prank(user);
        uint256 shares = vault.deposit(100 ether, user);

        assertEq(shares, 100 ether);
        assertEq(vault.totalAssets(), 100 ether);
        assertEq(token.balanceOf(address(vault)), 100 ether);
    }

    function testDepositWithStrategyAndWithdraw() public {
        // set yield strategy
        vault.setYieldStrategy(address(yieldStrategy));

        // mint and deposit
        token.mint(user, 200 ether);
        vm.prank(user);
        token.approve(address(vault), 200 ether);
        vm.prank(user);
        uint256 shares = vault.deposit(200 ether, user);

        // after deposit, vault should have forwarded tokens to strategy
        assertEq(yieldStrategy.totalAssets(), 200 ether);
        assertEq(token.balanceOf(address(vault)), 0);

        // withdraw some assets (caller is user, so must be owner of shares)
        vm.prank(user);
        uint256 withdrawn = vault.withdraw(50 ether, user, user);
        assertEq(withdrawn, 50 ether);
        // strategy should have decreased
        assertEq(yieldStrategy.totalAssets(), 150 ether);
    }

    function testHarvestFlow() public {
        // set strategies
        vault.setYieldStrategy(address(yieldStrategy));
        vault.setAllocationStrategy(address(allocationStrategy));

        // deposit to create some baseline assets in strategy
        token.mint(user, 500 ether);
        vm.prank(user);
        token.approve(address(vault), 500 ether);
        vm.prank(user);
        vault.deposit(500 ether, user);

        // pre balances
        uint256 beforeFeeRecipient = token.balanceOf(feeRecipient);
        uint256 beforeAlloc = allocationStrategy.received();

        uint256 expectedYield = 100 ether;
        uint256 expectedProtocolFee = (expectedYield * vault.protocolFeeBps()) / vault.BPS_DENOMINATOR();
        uint256 expectedDonation = expectedYield - expectedProtocolFee;

        // ensure interval passed
        vm.warp(block.timestamp + vault.minHarvestInterval() + 1);
        uint256 yieldAmount = vault.harvest();

        // protocol fee should have been transferred
        uint256 protocolFee = (yieldAmount * vault.protocolFeeBps()) / vault.BPS_DENOMINATOR();
        assertEq(token.balanceOf(feeRecipient), beforeFeeRecipient + protocolFee);

        // allocation strategy should have received the donation amount
        uint256 donation = yieldAmount - protocolFee;
        assertEq(allocationStrategy.received(), beforeAlloc + donation);

        assertEq(vault.totalYieldGenerated(), yieldAmount);
        assertEq(vault.totalYieldDonated(), donation);
        assertTrue(vault.lastHarvestTimestamp() > 0);
    }

    function testSettersAndGuards() public {
        // set allocation
        vm.expectEmit(true, true, true, true);
        emit Events.AllocationStrategyUpdated(address(0), address(allocationStrategy));
        vault.setAllocationStrategy(address(allocationStrategy));

        // protocol fee bounds
        uint256 tooHigh = vault.MAX_FEE_BPS();
        tooHigh += 1;
        vm.expectRevert(bytes("Fee too high"));
        vault.setProtocolFee(tooHigh);

        // set valid protocol fee
        vm.expectEmit(true, false, false, true);
        emit Events.ProtocolFeeUpdated(vault.protocolFeeBps(), 100);
        vault.setProtocolFee(100);

        // set fee recipient zero rejected
        vm.expectRevert(bytes("Invalid recipient"));
        vault.setFeeRecipient(address(0));

        // set valid fee recipient
        vm.expectEmit(true, true, false, true);
        emit Events.FeeRecipientUpdated(feeRecipient, user);
        vault.setFeeRecipient(user);

        // set keeper
        vm.expectEmit(true, true, false, true);
        emit Events.KeeperUpdated(vault.keeper(), user);
        vault.setKeeper(user);

        // set min harvest interval too short
        vm.expectRevert(bytes("Interval too short"));
        vault.setMinHarvestInterval(30 minutes);

        // valid interval
        vault.setMinHarvestInterval(2 hours);
        assertEq(vault.minHarvestInterval(), 2 hours);
    }

    function testPauseUnpauseAndEmergency() public {
        // pause
        vault.pause();
        // depositing should revert
        token.mint(user, 10 ether);
        vm.prank(user);
        token.approve(address(vault), 10 ether);
        vm.prank(user);
        vm.expectRevert();
        vault.deposit(10 ether, user);

        // unpause
        vault.unpause();
        vm.prank(user);
        vault.deposit(10 ether, user);

        // emergency withdraw
        // set yield strategy and deposit to it
        vault.setYieldStrategy(address(yieldStrategy));
        token.mint(user, 100 ether);
        vm.prank(user);
        token.approve(address(vault), 100 ether);
        vm.prank(user);
        vault.deposit(100 ether, user);

        // perform emergency withdraw and assert paused state and balances
        vault.emergencyWithdraw();
        assertTrue(vault.paused());
    }
}
