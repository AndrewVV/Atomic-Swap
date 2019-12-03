pragma solidity 0.5.10;

contract AtomicSwap {

    struct Swap {
        bytes32 hashedSecret;
        bytes32 secret;
        uint initTimestamp;
        uint refundTime;
        address payable initiator;
        uint nonce;
        address payable participant;
        uint256 value;
        bool emptied;
        bool initiated;
    }

    mapping(bytes32 => Swap) public swaps;

    event Refunded(
        bytes32 indexed _hashedSecret,
        uint _refundTime
    );
    event Redeemed(
        bytes32 indexed _hashedSecret,
        bytes32 _secret,
        uint _redeemTime
    );
    event Initiated(
        bytes32 indexed _hashedSecret,
        uint _initTimestamp,
        uint _refundTime,
        address indexed _participant,
        address indexed _initiator,
        uint256 _value
    );

    constructor() public {
    }

    modifier isRefundable(bytes32 _hashedSecret) {
        require(block.timestamp > swaps[_hashedSecret].initTimestamp + swaps[_hashedSecret].refundTime, "refundTime has not come");
        _;
    }

    modifier isRedeemable(bytes32 _hashedSecret, bytes32 _secret) {
        require(block.timestamp <= swaps[_hashedSecret].initTimestamp + swaps[_hashedSecret].refundTime, "refundTime has already come");
        // require(sha256(abi.encodePacked(sha256(abi.encodePacked(_secret)))) == _hashedSecret, "secret is not correct"); // 2SHA
        require(sha256(abi.encodePacked(_secret)) == _hashedSecret, "secret is not correct"); // SHA
        // require(ripemd160(abi.encodePacked(_secret)) == _hashedSecret, "secret is not correct");
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
        swaps[_hashedSecret].initiated = true;

        emit Initiated(
            _hashedSecret,
            swaps[_hashedSecret].initTimestamp,
            swaps[_hashedSecret].refundTime,
            swaps[_hashedSecret].participant,
            msg.sender,
            swaps[_hashedSecret].value
        );
    }

    function redeem(bytes32 _hashedSecret, bytes32 _secret) public isInitiated(_hashedSecret) isRedeemable(_hashedSecret, _secret) {
        swaps[_hashedSecret].emptied = true;
        swaps[_hashedSecret].secret = _secret;

        emit Redeemed(
            _hashedSecret,
            _secret,
            block.timestamp
        );

        swaps[_hashedSecret].participant.transfer(swaps[_hashedSecret].value);
    }

    function refund(bytes32 _hashedSecret) public isInitiated(_hashedSecret) isRefundable(_hashedSecret) {
        swaps[_hashedSecret].emptied = true;
        swaps[_hashedSecret].initiated = false;

        emit Refunded(
            _hashedSecret,
            block.timestamp
        );

        swaps[_hashedSecret].initiator.transfer(swaps[_hashedSecret].value);
    }
    
    function stringToBytes32(string memory source) public view returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function bytes32ToSHA256(bytes32 _secret) public view returns(bytes32) {
        return sha256(abi.encodePacked(_secret));
    }
 
    function bytes32To2SHA256(bytes32 _secret) public view returns(bytes32) {
        return sha256(abi.encodePacked(sha256(abi.encodePacked(_secret))));
    }
    
    function bytes32ToRipemd160 (bytes32 _secret) public view returns(bytes20) {
        return ripemd160(abi.encodePacked(_secret));
    }
    
    function stringToRipemd160 (string memory _secret) public view returns(bytes20) {
        return ripemd160(abi.encodePacked(_secret));
    }
    
    function stringToSHA256(string memory source) public view returns(bytes32) {
        return sha256(abi.encodePacked(source));
    }
    
    function stringTo2SHA256(string memory source) public view returns(bytes32) {
        return sha256(abi.encodePacked(sha256(abi.encodePacked(source))));
    }
    
    function getTimestamp() public view returns(uint256) {
        return block.timestamp;
    }
    
    function getTimestampPlusHour() public view returns(uint256) {
        return block.timestamp+3600;
    }
    
    function getBalanceSwap(bytes32 _hashedSecret) public view returns (uint256) {
        return swaps[_hashedSecret].value;
    }
    
    function getSecretSwap(bytes32 _hashedSecret) public view returns (bytes32) {
        return swaps[_hashedSecret].secret;
    }
}