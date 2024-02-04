//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

interface ICollateralFunds {
    function transferFunds(address user, uint256 amount) external;

    function returnFunds(address user) external payable;
}

contract Collateral is ERC721Holder {
    constructor(address _collateralFunds) payable {
        funds = ICollateralFunds(_collateralFunds);
    }

    ICollateralFunds funds;

    uint256 totalDeposits = 0;
    uint256 releaseAmount;
    uint256 currentLiquidationThreshold = 90;

    struct Stake {
        address contractAdd;
        uint256 tokenId;
        address owner;
        uint256 timestamp;
        uint256 value;
        uint256 term; //weeks
    }

    struct UserCreditHealth {
        uint256 borrowBalance;
        uint256 healthFactor;
        uint256 sucessfulReturns;
        uint256 creditLimit;
        uint256 creditScore;
    }

    event updatedHealthFactor(address owner, uint256 value);
    event updatedSucessfulReturns(address owner, uint256 value);
    event updatedCreditLimit(address owner, uint256 value);
    event updatedCreditStore(address owner, uint256 value);
    event staked(
        address owner,
        address contractAdd,
        uint256 tokenId,
        uint256 value,
        uint256 _term
    );
    event unstaked(
        address owner,
        address contractAdd,
        uint256 tokenId,
        uint256 value,
        uint256 _term
    );
    event claimed(address owner, uint256 amount);

    mapping(address => bool) public isReturnUser;
    mapping(address => Stake) public userToStake;
    mapping(address => bool) public hasClaimed;
    mapping(address => UserCreditHealth) public addressToUserCreditHealth;

    function getCreditScore() public view returns (uint256) {
        return addressToUserCreditHealth[msg.sender].creditScore;
    }

    function getHealthFactor() public view returns (uint256) {
        return addressToUserCreditHealth[msg.sender].healthFactor;
    }

    function getSucessfulReturns() public view returns (uint256) {
        return addressToUserCreditHealth[msg.sender].sucessfulReturns;
    }

    function getCreditLimit() public view returns (uint256) {
        return addressToUserCreditHealth[msg.sender].creditLimit;
    }

    function setCreditLimit() public {
        if ((addressToUserCreditHealth[msg.sender].creditScore / 30) < 90) {
            addressToUserCreditHealth[msg.sender]
                .creditLimit = (addressToUserCreditHealth[msg.sender]
                .creditScore / 15);
        }
        if ((addressToUserCreditHealth[msg.sender].creditScore / 30) < 40) {
            addressToUserCreditHealth[msg.sender].creditLimit = 40;
        }
        if ((addressToUserCreditHealth[msg.sender].creditScore / 30) > 15) {
            addressToUserCreditHealth[msg.sender].creditLimit = 80;
        }

        emit updatedCreditLimit(
            msg.sender,
            addressToUserCreditHealth[msg.sender].creditLimit
        );
    }

    function setCreditScore(uint256 newCreditScore) public {
        addressToUserCreditHealth[msg.sender].creditScore = newCreditScore;
        emit updatedCreditStore(msg.sender, newCreditScore);
    }

    function setSucessfulReturns() public {
        addressToUserCreditHealth[msg.sender]
            .sucessfulReturns = (addressToUserCreditHealth[msg.sender]
            .sucessfulReturns + 1);
        emit updatedSucessfulReturns(
            msg.sender,
            addressToUserCreditHealth[msg.sender].sucessfulReturns
        );
    }

    function setHealthFactor() public {
        addressToUserCreditHealth[msg.sender].healthFactor =
            100 -
            ((((userToStake[msg.sender].value) * currentLiquidationThreshold) /
                100) / addressToUserCreditHealth[msg.sender].borrowBalance);
        emit updatedSucessfulReturns(
            msg.sender,
            addressToUserCreditHealth[msg.sender].healthFactor
        );
    }

    function deposit(
        address _contract,
        uint256 _tokenId,
        uint256 _value,
        uint256 _term
    ) public {
        if (isReturnUser[msg.sender] == false) {
            addressToUserCreditHealth[msg.sender] = UserCreditHealth(
                0,
                0,
                0,
                30,
                300
            );
            isReturnUser[msg.sender] = true;
        }

        IERC721 nftContract = IERC721(_contract);

        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "only owner of token can deposit"
        );
        // term not required to facilitate testing for hackaton
        // require(_term >= 4 * 604800); // term should be atleast 1 month
        // require(_term <= 32 * 604800); // term should be less than 4 months
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        userToStake[msg.sender] = Stake(
            _contract,
            _tokenId,
            payable(msg.sender),
            block.timestamp,
            _value,
            _term
        ); // storing term as weeks as (* 604800)
        emit staked(msg.sender, _contract, _tokenId, _value, _term);
        addressToUserCreditHealth[msg.sender]
            .creditScore = (addressToUserCreditHealth[msg.sender].creditScore +
            100);
        setCreditLimit();
        totalDeposits += 1;
    }

    function claim(uint256 claimAmount) public {
        require(!hasClaimed[msg.sender]);

        require(
            claimAmount <=
                ((userToStake[msg.sender].value / 100) *
                    addressToUserCreditHealth[msg.sender].creditLimit)
        );
        funds.transferFunds(msg.sender, claimAmount);
        addressToUserCreditHealth[msg.sender].borrowBalance = claimAmount;
        hasClaimed[msg.sender] = true;
        addressToUserCreditHealth[msg.sender]
            .creditScore = (addressToUserCreditHealth[msg.sender].creditScore +
            40);
        setCreditLimit();
        setHealthFactor();
        emit claimed(msg.sender, userToStake[msg.sender].value);
    }

    function unstake() public payable {
        Stake memory crtStake = userToStake[msg.sender];
        // term not required to facilitate testing for hackaton
        //require(block.timestamp - crtStake.timestamp >= crtStake.term, "term not over yet");
        funds.returnFunds(msg.sender);
        IERC721 currentNft = IERC721(crtStake.contractAdd);
        currentNft.safeTransferFrom(
            address(this),
            msg.sender,
            crtStake.tokenId
        );
        delete userToStake[msg.sender];
        delete hasClaimed[msg.sender];
        addressToUserCreditHealth[msg.sender].sucessfulReturns =
            addressToUserCreditHealth[msg.sender].sucessfulReturns +
            1;
        addressToUserCreditHealth[msg.sender]
            .creditScore = (addressToUserCreditHealth[msg.sender].creditScore +
            30);
        addressToUserCreditHealth[msg.sender].borrowBalance = 0;
        addressToUserCreditHealth[msg.sender].healthFactor = 0;
        setCreditLimit();
        // emit unstaked(msg.sender, crtStake.contractAdd, crtStake.tokenId, crtStake.value, crtStake.term);
    }

    function fetchNftValue() public view returns (uint256) {
        Stake memory crtStake = userToStake[msg.sender];
        return crtStake.value;
    }

    function fetchStake() public view returns (Stake memory) {
        return userToStake[msg.sender];
    }

    function fetchDepositAmount() public view returns (uint256) {
        return totalDeposits;
    }
}
