// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../lib/IYieldStrategy.sol";
import "../lib/IAllocationStrategy.sol";
import "../lib/events.sol";

contract UniDonateVault is ERC20, ERC4626, Ownable, ReentrancyGuard, Pausable {
    // State variables
    IYieldStrategy public yieldStrategy;
    IAllocationStrategy public allocationStrategy;

    uint256 public totalYieldGenerated;
    uint256 public totalYieldDonated;
    uint256 public lastHarvestTimestamp;
    uint256 public minHarvestInterval = 1 days;

    // Fee configuration (in basis points, 100 = 1%)
    uint256 public protocolFeeBps = 200; // 2% protocol fee
    uint256 public constant MAX_FEE_BPS = 1000; // Max 10%
    uint256 public constant BPS_DENOMINATOR = 10000;

    address public feeRecipient;
    address public keeper;

    modifier onlyKeeper() {
        require(msg.sender == keeper || msg.sender == owner(), "Not keeper");
        _;
    }

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _feeRecipient
    ) ERC20(_name, _symbol) ERC4626(_asset) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        keeper = msg.sender;
    }

    /**
     * @notice Override decimals to resolve conflict between ERC20 and ERC4626
     * @dev Both ERC20 and ERC4626 define decimals(), so we must explicitly choose one
     * @return uint8 The number of decimals (matches the underlying asset)
     */
    function decimals() public view override(ERC20, ERC4626) returns (uint8) {
        return ERC4626.decimals();
    }

    /**
     * @notice Total assets under management including strategy deposits
     */
    function totalAssets() public view override returns (uint256) {
        uint256 idle = IERC20(asset()).balanceOf(address(this));
        uint256 deployed = address(yieldStrategy) != address(0)
            ? yieldStrategy.totalAssets()
            : 0;
        return idle + deployed;
    }

    /**
     * @notice Deposit assets into the vault
     * @dev Override to add pause functionality
     */
    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused nonReentrant returns (uint256) {
        uint256 shares = super.deposit(assets, receiver);

        // Deploy to yield strategy if available
        if (address(yieldStrategy) != address(0)) {
            uint256 balance = IERC20(asset()).balanceOf(address(this));
            if (balance > 0) {
                IERC20(asset()).approve(address(yieldStrategy), balance);
                yieldStrategy.deposit(balance);
            }
        }

        return shares;
    }

    /**
     * @notice Withdraw assets from the vault
     * @dev Override to handle strategy withdrawals
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override nonReentrant returns (uint256) {
        uint256 idle = IERC20(asset()).balanceOf(address(this));

        // Withdraw from strategy if needed
        if (assets > idle && address(yieldStrategy) != address(0)) {
            uint256 needed = assets - idle;
            yieldStrategy.withdraw(needed);
        }

        return super.withdraw(assets, receiver, owner);
    }

    /**
     * @notice Harvest yield from strategy and donate to beneficiaries
     * @dev Can only be called by keeper or owner
     */
    function harvest() external onlyKeeper nonReentrant returns (uint256) {
        require(
            block.timestamp >= lastHarvestTimestamp + minHarvestInterval,
            "Harvest too soon"
        );
        require(address(yieldStrategy) != address(0), "No yield strategy");
        require(
            address(allocationStrategy) != address(0),
            "No allocation strategy"
        );

        // Harvest from yield strategy
        uint256 yieldAmount = yieldStrategy.harvest();
        require(yieldAmount > 0, "No yield to harvest");

        totalYieldGenerated += yieldAmount;
        lastHarvestTimestamp = block.timestamp;

        // Calculate protocol fee
        uint256 protocolFee = (yieldAmount * protocolFeeBps) / BPS_DENOMINATOR;
        uint256 donationAmount = yieldAmount - protocolFee;

        // Transfer protocol fee
        if (protocolFee > 0) {
            IERC20(asset()).transfer(feeRecipient, protocolFee);
        }

        // Donate remaining yield
        IERC20(asset()).approve(address(allocationStrategy), donationAmount);
        allocationStrategy.allocateYield(donationAmount);

        totalYieldDonated += donationAmount;

        emit Events.YieldHarvested(yieldAmount, protocolFee, donationAmount);

        return yieldAmount;
    }

    /**
     * @notice Set the yield generation strategy
     * @param _strategy Address of the new strategy
     */
    function setYieldStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");

        // Withdraw all from old strategy if exists
        if (address(yieldStrategy) != address(0)) {
            uint256 strategyBalance = yieldStrategy.totalAssets();
            if (strategyBalance > 0) {
                yieldStrategy.withdraw(strategyBalance);
            }
        }

        address oldStrategy = address(yieldStrategy);
        yieldStrategy = IYieldStrategy(_strategy);

        emit Events.StrategyUpdated(oldStrategy, _strategy);
    }

    /**
     * @notice Set the allocation strategy
     * @param _strategy Address of the new allocation strategy
     */
    function setAllocationStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        address oldStrategy = address(allocationStrategy);
        allocationStrategy = IAllocationStrategy(_strategy);
        emit Events.AllocationStrategyUpdated(oldStrategy, _strategy);
    }

    /**
     * @notice Update protocol fee
     * @param _newFeeBps New fee in basis points
     */
    function setProtocolFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee too high");
        uint256 oldFee = protocolFeeBps;
        protocolFeeBps = _newFeeBps;
        emit Events.ProtocolFeeUpdated(oldFee, _newFeeBps);
    }

    /**
     * @notice Update fee recipient
     * @param _newRecipient New fee recipient address
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = _newRecipient;
        emit Events.FeeRecipientUpdated(oldRecipient, _newRecipient);
    }

    /**
     * @notice Update keeper address
     * @param _newKeeper New keeper address
     */
    function setKeeper(address _newKeeper) external onlyOwner {
        require(_newKeeper != address(0), "Invalid keeper");
        address oldKeeper = keeper;
        keeper = _newKeeper;
        emit Events.KeeperUpdated(oldKeeper, _newKeeper);
    }

    /**
     * @notice Set minimum harvest interval
     * @param _interval New interval in seconds
     */
    function setMinHarvestInterval(uint256 _interval) external onlyOwner {
        require(_interval >= 1 hours, "Interval too short");
        minHarvestInterval = _interval;
    }

    /**
     * @notice Pause deposits
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause deposits
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw all funds from strategy
     * @dev Only callable by owner in emergencies
     */
    function emergencyWithdraw() external onlyOwner {
        if (address(yieldStrategy) != address(0)) {
            uint256 strategyBalance = yieldStrategy.totalAssets();
            if (strategyBalance > 0) {
                yieldStrategy.withdraw(strategyBalance);
                emit Events.EmergencyWithdraw(strategyBalance);
            }
        }
        _pause();
    }
}