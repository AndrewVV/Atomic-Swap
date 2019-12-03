const bitcoin = require('bitcoinjs-lib');
const BigNumber = require('bignumber.js');
const fetch = require('node-fetch');
const GET = 'GET';
const POST = 'POST';
const token = 'dfd8006109664a708db0efc9b704c107';
const BTCDECIMALS = 8;
const log = console.log;
const net = bitcoin.networks.testnet;
const password = "123"; 
// let secret = "3132330000000000000000000000000000000000000000000000000000000000" // do eth side
// let secret = "0xc210667c74cb811fd43d620d7941c49282fd9d5a73b5413dcc5d47cc56de5602"; 
// let secretHash =  "5c8d08390f7b011aa2cc9cf2b4a5d73b8caf1cfc";
// let secretHash = bitcoin.crypto.ripemd160(secret);
// log(secretHash,"secretHash");

// ITS working
// let secret = "c210667c74cb811fd43d620d7941c49282fd9d5a73b5413dcc5d47cc56de5602"; // ITS working
// let secretHash = bitcoin.crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex');   // ITS working
// let secretHash =  "5c8d08390f7b011aa2cc9cf2b4a5d73b8caf1cfc";
// log("secretHash", secretHash);  // ITS working

// let secretHash = '1a9997ee49ed6a97a1bb5ec5c093047819d69390';
// log("secret", secret);

let secret = "3132330000000000000000000000000000000000000000000000000000000000"; // ITS working
// let secretHash = bitcoin.crypto.sha256(Buffer.from(secret, 'hex')).toString('hex');   // ITS working
// log("secretHash", secretHash);  // ITS working
let secretHash = "ed88bb4d5991f2f91939d37277c0f988bbf461c889cafbdd5384ecb881ce6bf3";


// let ownerAddress = "mjYWRYYJxQ8oPz8obovrDbcEyd4EwLufgy";
let ownerPublicKey = '0246fd20f628f6fc5a309dc4b5ef310b039af89da2dbb01c32cf91a3512ea42054';
let ownerPrivateKey = "cV6Lyq7pYvQaCaksTPqnTS9oMvFBvTLZt915ceG3iMoCnmT2Ncog";
let recipientAddress = "mrpSQFbnbKFKUUX7u25TToMp1mfBReVXQU";
let recipientPublicKey = '034ec69311a2f260c49ea3a1e0f231de24337b923b672c60ded9fc090ba8db09bf';
let recipientPrivateKey = 'cR7gyUi8cQCiL7RWR34ZNSYwGTRwG1PhmWkZ9aeqHENhPcv4bb6d';
let locktime = 1574876120;// old =  1571142109;
// let utcNow = Math.floor(Date.now() / 1000)
// log(utcNow, "utcNow sec");
// let getLockTime = utcNow+3600*100 // 100 hours from now
// log(getLockTime, "getLockTime sec")

const scriptValues = {
    secretHash,
    ownerPublicKey,
    recipientPublicKey,
    locktime,
}
let amount = 0.01
// let scriptAddress = "2My2MMReNuGHZmhzcCcvG3jLi4yoPXoXuEK"

class AtomicBtc {
    constructor(){
        // this.createScript(scriptValues)
        // this.fundScript({scriptValues, amount})
        // this.withdrawRawTransaction({scriptValues, secret})
    }

    createScript(data) {
      const {secretHash, ownerPublicKey, recipientPublicKey, locktime} = data
        const script = bitcoin.script.compile([
            bitcoin.opcodes.OP_SHA256, // OP_RIPEMD160,
            Buffer.from(secretHash, 'hex'),
            bitcoin.opcodes.OP_EQUALVERIFY,
    
            Buffer.from(recipientPublicKey, 'hex'),
            bitcoin.opcodes.OP_EQUAL,
            bitcoin.opcodes.OP_IF,
    
            Buffer.from(recipientPublicKey, 'hex'),
            bitcoin.opcodes.OP_CHECKSIG,
            
            bitcoin.opcodes.OP_ELSE,
            
            bitcoin.script.number.encode(locktime),
            bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
            bitcoin.opcodes.OP_DROP,
            Buffer.from(ownerPublicKey, 'hex'),
            bitcoin.opcodes.OP_CHECKSIG,
            
            bitcoin.opcodes.OP_ENDIF,
        ])
        const scriptPubKey  = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(script))
        const scriptAddress = bitcoin.address.fromOutputScript(scriptPubKey, net)
        log("scriptAddress in createScript:",scriptAddress)
        return {
            scriptAddress,
            script,
        }
    }

    fundScript(data, handleTransactionHash, hashName, fee) {
        return new Promise(async (resolve, reject) => {
            // const { scriptValues, amount } = data
            try {
                // if(!fee){
                //     fee=0.0001;
                // }
                // amount = this.fromDecimals(amount);
                // amount = Math.round(amount)
                // const { scriptAddress } = this.createScript(scriptValues, hashName)
                const scriptAddress = "2MuLauj5uxvSaMH3gXppKMWThxHd2b3rjSS";
                log(scriptAddress)
                let ownerAddress = "mjYWRYYJxQ8oPz8obovrDbcEyd4EwLufgy";
                const tx = new bitcoin.TransactionBuilder(net)
                // const unspents = await this.fetchUnspents(ownerAddress)
                const unspents = [{
                    address: "mjYWRYYJxQ8oPz8obovrDbcEyd4EwLufgy",
                    amount: 0.02469806,
                    confirmations: 908,
                    height: 1579787,
                    satoshis: 353275,
                    scriptPubKey: "76a9142f18c1865ec2e4af33d3d0ac4bb22fcd461472a388ac",
                    txid: "757d9d1bfa7e3e8fa57e78f407d29e828fbcc53d59d9daa18e591ed54b8850b3",
                    vout: 0,
                }]
                let txid = "73ce82869583b88d9cb4ab17886817ef4c9d2b7598db1d00b7ac997cdb5d2c41";
                let vout = 1;
                // const fundValue = amount.multipliedBy(1e8).integerValue().toNumber()
                const fundValue = 1000;
                log(fundValue)
                // const feeValue = await this.getTxFee({ inSatoshis: true, address: ownerAddress })
                const feeValue = 10000
                // const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
                const totalUnspent = 449806;
                const skipValue = totalUnspent - fundValue - feeValue
                log("skipValue", skipValue)
                if (totalUnspent < feeValue + fundValue) {
                    throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
                }
                tx.addInput(txid, vout)
                tx.addOutput(scriptAddress, fundValue)
                tx.addOutput(ownerAddress, skipValue)
                let keyring = bitcoin.ECPair.fromWIF(ownerPrivateKey,net);
                tx.sign(0, keyring)
                let txRaw = tx.build().toHex()
                log("txRaw",txRaw)
                return resolve(txRaw)
            }catch (err) {
                reject(err)
            }
        })
      }

    async withdrawRawTransaction(data, isRefund, hashName) {
        const { scriptValues, secret } = data
        const { script, scriptAddress } = this.createScript(scriptValues, hashName)
        log(scriptAddress)
        log(scriptValues.locktime)
        // const { destinationAddress } = data
      
        const tx  = new bitcoin.TransactionBuilder(net) 
        // const unspents = this.fetchUnspents(scriptAddress)
        // let utxoData = await this.getUtxo(scriptAddress);
        let txid = "465106ffb5b48e8a6c122beb37c65d4c656d26090a2ae33ce5be07d8f13522ac";
        let vout = 0;
        const feeValue = 100; // TODO how to get this value
        // const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
        const totalUnspent  = 1000;
        
        if (BigNumber(totalUnspent).isLessThan(feeValue)) {
            throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue}`)
        }
        // if (isRefund) {
        //     tx.setLockTime(scriptValues.lockTime)
        // }
        tx.addInput(txid, vout, 0xfffffffe)
        tx.addOutput(recipientAddress, totalUnspent - feeValue)
        let txRaw = tx.buildIncomplete()
        // log(txRaw)
        txRaw = this.signTransaction({script,secret,txRaw})
        log("finish txRaw", txRaw.toHex())
        //return txRaw
    };

    signTransaction(data, inputIndex = 0) {
        // debug('swap.core:swaps')('signing script input', inputIndex)
        const { script, txRaw, secret } = data
        // log(data)
        const hashType = bitcoin.Transaction.SIGHASH_ALL
        // log(hashType)
        const signatureHash = txRaw.hashForSignature(inputIndex, script, hashType)
        // log(signatureHash)
        let keyring = bitcoin.ECPair.fromWIF(recipientPrivateKey,net);
        // log(keyring)
        const signature = keyring.sign(signatureHash).toScriptSignature(hashType)
        // log(signature)    
        const scriptSig = bitcoin.script.scriptHash.input.encode(
          [
            signature,
            keyring.getPublicKeyBuffer(),
            Buffer.from(secret.replace(/^0x/, ''), 'hex'),
          ],
          script,
        )
    
        txRaw.setInputScript(inputIndex, scriptSig)
        return txRaw
      }

    getBalance(address, raw=true){
        return new Promise(async(resolve,reject)=>{
            try{
                let url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`;
                let result = await this.getRequest(url).then(response=>response.json());
                // this.validator.validateObject(result);
                let balance = result.balance;
                log(balance)
                if(!raw){
	                balance = this.toDecimals(balance)
                }
                // this.validator.validateNumber(balance);
                return resolve(balance);
            }catch (e) {
                return reject(e);
            }
        });
    }

    getUtxos(address,amount,fee){
        return new Promise(async(resolve,reject)=>{
            try{
	            this.validator.validateBtcAddress(address);
	            this.validator.validateNumber(amount);
	            this.validator.validateNumber(fee);

                let balance = await this.getBalance();
                if(balance >= amount+fee){
                	let allUtxo = await this.listUnspent(address);
                	let tmpSum = 0;
                	let requiredUtxo = [];
                	for(let key in allUtxo){
                    	if(tmpSum<=amount+fee){
                    		tmpSum+=allUtxo[key].value;
                    		requiredUtxo.push({
                    	    	txid:allUtxo[key].tx_hash,
                    	    	vout:allUtxo[key].tx_output_n
                    		})
                    	}else{
                    		break;
	                    }
	                }
	                let change = tmpSum - amount - fee;
	                this.validator.validateNumber(change);
	                return resolve({
	                	"change":change,
	                    "outputs":requiredUtxo
	                });
	                }else{
                        amount = this.toDecimals(amount)
                        fee = this.toDecimals(fee)
                        balance = this.toDecimals(balance)
                        alert("Insufficient balance: trying to send "+amount+" BTC + "+fee+" BTC fee when having "+balance+" BTC")
	                }
            }catch(e){
                return reject(e);
            }
        });
    }

    listUnspent(address){
        return new Promise(async(resolve,reject)=>{
            try{
   	            // this.validator.validateBtcAddress(address);
            	let url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`
                let data = await this.getRequest(url).then(response=>response.json())
                let unspents = data.txrefs;
                return resolve(unspents);
            }catch(e){
                return reject(e);
            }
        })
    }

    toDecimals(amount){
        return WeiConverter.formatToDecimals(amount,BTCDECIMALS);
    }
    fromDecimals(amount){
        return WeiConverter.formatFromDecimals(amount,BTCDECIMALS);
    }

    postRequest(req_url,data,headers) {
        return new Promise(async(resolve,reject)=>{
            try{
                if(!headers){
                    headers = {"Content-Type": "application/json"};
                }
                var result = await this.httpRequest(POST, req_url,data,headers)
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    };
    getRequest(req_url,data,headers) {
        return new Promise(async(resolve,reject)=>{
            try{
                var result = await this.httpRequest(GET, req_url,data,headers)
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    };
    
    httpRequest(method,req_url,data,headers={}){
        return new Promise(async(resolve,reject)=>{

            var options={
                body:data,
                method: method,
                headers: headers
            };
            fetch(req_url,options).then((res)=>{
                return resolve(res);
            }).catch(function (err) {
                return reject(err)
            });
        })
    }
}
module.exports = AtomicBtc
let atomicBtc = new AtomicBtc()