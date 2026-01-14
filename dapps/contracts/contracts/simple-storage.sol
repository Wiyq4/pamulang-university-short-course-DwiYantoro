// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract SimpleStorage {
    address public owner;
    uint256 private value;
    string private message;

    // 🔔 Events
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event MessageUpdated(string oldMessage, string newMessage);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), owner);
    }

    // READ
    function getValue() public view returns (uint256) {
        return value;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    // WRITE (ONLY OWNER)
    function setValue(uint256 _value) public onlyOwner {
        uint256 old = value;
        value = _value;
        emit ValueUpdated(old, _value);
    }

    function setMessage(string calldata _message) public onlyOwner {
        string memory old = message;
        message = _message;
        emit MessageUpdated(old, _message);
    }
}
