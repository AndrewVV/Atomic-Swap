let bitcore = require('bitcore-lib')
let testnet = bitcore.Networks.get("testnet")
let mnemonic = "good elegant service dwarf holiday type aisle cement usual permit tank okay"
let mailAddress = "mjYWRYYJxQ8oPz8obovrDbcEyd4EwLufgy";
    
    // ГЕНЕРАЦИЯ ПРИВАТНИКА И АДРЕСА
    // let privateKey = new bitcore.PrivateKey(testnet)
    // console.log(privateKey)
    // var address = privateKey.toAddress();
    // console.log(address)
    
    // КОНВЕРТАЦИЯ ПРИВАТНИКА В АДРЕС
    // var wif = 'cT5n9yx1xw3TcbvpEAuXvzhrTb5du4RAYbAbTqHfZ9nbq6gJQMGn';
    // var address = new bitcore.PrivateKey(wif).toAddress(testnet);
    // console.log(address)

    //КОНВЕРТАЦИЯ ПРИВАТНИКА В ПУБЛИЧНЫЙ КЛЮЧ
    // var wif = 'cT5n9yx1xw3TcbvpEAuXvzhrTb5du4RAYbAbTqHfZ9nbq6gJQMGn';
    // var address = new bitcore.PrivateKey(wif).toPublicKey(testnet);
    // console.log("public key: ",address)
    
    
    // ПОДПИСЬ СООБЩЕНИЯ
    // var Message = bitcore.Message
    // var privateKey = bitcore.PrivateKey('f7d3f769fb0a298bba9ad705ec3e2269d98b4ff0585b6718ce9c274ead3b81cf');
    // console.log(privateKey)
    // var message = Message('This is an example of a signed message.');
    // console.log(message)
    // var signature = message.sign(privateKey);
    // console.log(signature)
    // var address = 'muafGdyEyDLWzFtMF7h5iKjerbuRP236jc';
    // var signature = 'IA7PRd1fUnCUP+6K5Sm10PRNhIAOoHovWFRGLSEJANpGUkbSZSqX7uhl6fHYiflr/hrJzOCjoZW66KwdO2yQn9A=';
    // var verified = Message('This is an example of a signed message.').verify(address, signature);
    // console.log(verified)
    
let publicKey1 = '0246fd20f628f6fc5a309dc4b5ef310b039af89da2dbb01c32cf91a3512ea42054'; // mjYWRYYJxQ8oPz8obovrDbcEyd4EwLufgy // 
let publicKey2 = '034ec69311a2f260c49ea3a1e0f231de24337b923b672c60ded9fc090ba8db09bf'; // mrpSQFbnbKFKUUX7u25TToMp1mfBReVXQU // 
let publicKey3 = '03998e05729e6832558469c91fba1dc3b5fab0995492071e30d1f84f084fa375cd'; // mpMPJwRFa5f1273gwHHfCm6GNV395FC7mi // 
let privateKey1 =  'cV6Lyq7pYvQaCaksTPqnTS9oMvFBvTLZt915ceG3iMoCnmT2Ncog'
let privateKey2 = 'cR7gyUi8cQCiL7RWR34ZNSYwGTRwG1PhmWkZ9aeqHENhPcv4bb6d'
let privateKey3 = 'cMpvMWLFuPMziAfJCyJUV6ToXDpaHVJ7eSdk83RoGcFdgK6p9QL5'
let requiredSignatures = 2;

let txId = "52dbca89142c304d96972ec5135254090a9262b381261ef3e4b33ee1c411f935";
let outputIndex = 0;
let outputAmount = 500000;
let to = 'mjYWRYYJxQ8oPz8obovrDbcEyd4EwLufgy';
let amount = 490000

    // СОЗДАНИЕ МУЛЬТИСИГ АДРЕСА 2 ИЗ 3k
    let publicKeys = [publicKey1,publicKey2,publicKey3];  
    var address = new bitcore.Address(publicKeys, requiredSignatures, testnet);
    console.log(address)
    console.log("Create multisig address = ",address.toString())
    // ОТПРАВКА МУЛЬТИСИГ ТРАНЗАКЦИИ
    var privateKeys = [
        new bitcore.PrivateKey(privateKey1),
        new bitcore.PrivateKey(privateKey2)
    ];
    var address = new bitcore.Address(publicKeys, 2, testnet); // 2 of 2
    console.log(address) 
      
    var utxo = {
        txId,
        outputIndex,
        "address" : address.toString(),
        "script" : new bitcore.Script(address).toHex(),
        "satoshis" : outputAmount
    };
      
    var transaction = new bitcore.Transaction()
        .from(utxo, publicKeys, 2)
        .to(to, amount)
        .sign(privateKeys);
    console.log(transaction)

    /////////////////////////////////////////////////////////////////////
    // let abi = require('ethereumjs-abi')
    // let web3 = require('web3')
    let bytes32;
    let etalonBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000"
    let password = "01061995andrii111"
    // passwordToSecret(password)
    
    function convertToBytes32(string){
        var result = web3.utils.fromAscii(string);
        if(result.length != etalonBytes32.length){
            let length = etalonBytes32.length - result.length
            bytes32 = addingZero(result,length)
        }
        return bytes32
    }

    function addingZero(string, length){
        for (let   i = 0;  i < length; i++) {
            string = string+"0"
        }
        return string
    }

    function passwordToSecret(password){
        console.log(password)
        let bytes32 = convertToBytes32(password)
        console.log(bytes32)
        let sha256 = abi.soliditySHA256([ "bytes32" ], [abi.soliditySHA256([ "bytes32" ], [bytes32])])
        sha256 = sha256.toString("hex")
        console.log("0x"+sha256)
    }