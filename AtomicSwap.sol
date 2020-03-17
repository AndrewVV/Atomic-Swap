pragma solidity 0.6.4;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    constructor() public {
        owner = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(msg.sender == owner, "msg.sender's address isn't owner address");
        _;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract AtomicSwap is Ownable {
    
    using SafeMath for uint256;

    struct Swap {
        bytes32 hashedSecret;
        bytes32 secret;
        uint initTimestamp;
        uint refundTime;
        address payable initiator;
        uint nonce;
        address payable participant;
        uint256 value;
        uint256 fee;
        bool emptied;
        bool initiated;
    }

    mapping(bytes32 => Swap) public swaps;
    
    uint8 public fee;
    uint256 public feeAmount;
    
    constructor() public {
        fee = 5;
        feeAmount = 0;
    }

    event Refunded(bytes32 indexed _hashedSecret, uint _refundTime);
    
    event Redeemed(bytes32 indexed _hashedSecret, bytes32 _secret, uint _redeemTime);
    
    event Initiated(
        bytes32 indexed _hashedSecret,
        uint _initTimestamp,
        uint _refundTime,
        address indexed _participant,
        address indexed _initiator,
        uint256 _value,
        uint256 _fee
    );
    
    event WithdrawFee(address indexed _owner, uint256 amount);

    modifier isRefundable(bytes32 _hashedSecret) {
        require(block.timestamp > swaps[_hashedSecret].initTimestamp + swaps[_hashedSecret].refundTime, "refundTime has not come");
        _;
    }

    modifier isRedeemable(bytes32 _hashedSecret, bytes32 _secret) {
        require(block.timestamp <= swaps[_hashedSecret].initTimestamp + swaps[_hashedSecret].refundTime, "refundTime has already come");
        require(sha256(abi.encodePacked(_secret)) == _hashedSecret, "secret is not correct");
        _;
    }

    modifier isInitiated(bytes32 _hashedSecret) {
        require(swaps[_hashedSecret].emptied == false, "swap for this hash is already emptied");
        require(swaps[_hashedSecret].initiated == true, "no initiated swap for such hash");
        _;
    }

    modifier isInitiatable(bytes32 _hashedSecret) {
        require(swaps[_hashedSecret].emptied == false, "swap for this hash is already emptied");
        require(swaps[_hashedSecret].initiated == false, "swap for this hash is already initiated");
        _;
    }

    function initiate (bytes32 _hashedSecret, uint _refundTime, address payable _participant)
    public payable isInitiatable(_hashedSecret) {
        
        swaps[_hashedSecret].hashedSecret = _hashedSecret;
        swaps[_hashedSecret].initTimestamp = block.timestamp;
        swaps[_hashedSecret].refundTime = _refundTime;
        swaps[_hashedSecret].initiator = msg.sender;
        swaps[_hashedSecret].participant = _participant;
        swaps[_hashedSecret].value = msg.value;
        swaps[_hashedSecret].fee = msg.value.div(100).mul(fee);
        swaps[_hashedSecret].initiated = true;

        emit Initiated(
            _hashedSecret,
            swaps[_hashedSecret].initTimestamp,
            swaps[_hashedSecret].refundTime,
            swaps[_hashedSecret].participant,
            msg.sender,
            swaps[_hashedSecret].value,
            swaps[_hashedSecret].fee
        );
    }

    function redeem(bytes32 _hashedSecret, bytes32 _secret) public isInitiated(_hashedSecret) isRedeemable(_hashedSecret, _secret) {
        swaps[_hashedSecret].emptied = true;
        swaps[_hashedSecret].secret = _secret;
        emit Redeemed(_hashedSecret, _secret, block.timestamp);
        swaps[_hashedSecret].participant.transfer(swaps[_hashedSecret].value-swaps[_hashedSecret].fee);
        feeAmount = feeAmount.add(swaps[_hashedSecret].fee);
    }

    function refund(bytes32 _hashedSecret) public isInitiated(_hashedSecret) isRefundable(_hashedSecret) {
        swaps[_hashedSecret].emptied = true;
        swaps[_hashedSecret].initiated = false;
        emit Refunded(_hashedSecret, block.timestamp);
        swaps[_hashedSecret].initiator.transfer(swaps[_hashedSecret].value);
    }
    
    function withdrawFee(uint256 _amount) public payable onlyOwner returns (bool) {
        require(_amount <= feeAmount, "amount more than feeAmount");
        feeAmount = feeAmount.sub(_amount);
        msg.sender.transfer(_amount);
        emit WithdrawFee(msg.sender, _amount);
        return true;
    }
    
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function bytes32ToSHA256(bytes32 _secret) public pure returns(bytes32) {
        return sha256(abi.encodePacked(_secret));
    }
    
    function stringToSHA256(string memory source) public pure returns(bytes32) {
        return sha256(abi.encodePacked(source));
    }
    
    function getTimestamp() public view returns(uint256) {
        return block.timestamp;
    }
    
    function getBalanceSwap(bytes32 _hashedSecret) public view returns (uint256) {
        return swaps[_hashedSecret].value;
    }
    
    function getSecretSwap(bytes32 _hashedSecret) public view returns (bytes32) {
        return swaps[_hashedSecret].secret;
    }
}