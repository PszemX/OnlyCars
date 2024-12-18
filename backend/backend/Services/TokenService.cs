using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.Numerics;

namespace backend.Services
{
    public class TokenService
    {
        private readonly string _contractAddress;
        private readonly string _network;

        public TokenService()
        {
            DotNetEnv.Env.Load();       
            _contractAddress = Environment.GetEnvironmentVariable("CONTRACT_ADDRESS")!;
            _network = Environment.GetEnvironmentVariable("NETWORK")!;
        }

        public async Task<decimal> GetBalance(string address)
        {
            var web3 = new Web3(_network);
            var contract = web3.Eth.GetContract(GetABI(), _contractAddress);
            var balanceFunction = contract.GetFunction("balanceOf");
            var balance = await balanceFunction.CallAsync<BigInteger>(address);
            return Web3.Convert.FromWei(balance);
        }

        public async Task<string> Transfer(string privateKey, string toAddress, decimal amount)
        {
            var account = new Account(privateKey);
            var web3 = new Web3(account, _network);
            var contract = web3.Eth.GetContract(GetABI(), _contractAddress);
            var weiAmount = Web3.Convert.ToWei(amount);

            var transferFunction = contract.GetFunction("transfer");
            var gas = await transferFunction.EstimateGasAsync(account.Address, null, null, toAddress, weiAmount);
            var receipt = await transferFunction.SendTransactionAndWaitForReceiptAsync(account.Address, gas, null, null, toAddress, weiAmount);

            return receipt.TransactionHash;
        }

        private string GetABI()
        {
            return @"[{""inputs"":[],""stateMutability"":""nonpayable"",""type"":""constructor""},{""anonymous"":false,""inputs"":[{""indexed"":true,""internalType"":""address"",""name"":""owner"",""type"":""address""},{""indexed"":true,""internalType"":""address"",""name"":""spender"",""type"":""address""},{""indexed"":false,""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""Approval"",""type"":""event""},{""anonymous"":false,""inputs"":[{""indexed"":true,""internalType"":""address"",""name"":""from"",""type"":""address""},{""indexed"":true,""internalType"":""address"",""name"":""to"",""type"":""address""},{""indexed"":false,""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""Transfer"",""type"":""event""},{""inputs"":[{""internalType"":""address"",""name"":""owner"",""type"":""address""},{""internalType"":""address"",""name"":""spender"",""type"":""address""}],""name"":""allowance"",""outputs"":[{""internalType"":""uint256"",""name"":"""",""type"":""uint256""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""spender"",""type"":""address""},{""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""approve"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""account"",""type"":""address""}],""name"":""balanceOf"",""outputs"":[{""internalType"":""uint256"",""name"":"""",""type"":""uint256""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""decimals"",""outputs"":[{""internalType"":""uint8"",""name"":"""",""type"":""uint8""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""name"",""outputs"":[{""internalType"":""string"",""name"":"""",""type"":""string""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""symbol"",""outputs"":[{""internalType"":""string"",""name"":"""",""type"":""string""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""totalSupply"",""outputs"":[{""internalType"":""uint256"",""name"":"""",""type"":""uint256""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""to"",""type"":""address""},{""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""transfer"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""from"",""type"":""address""},{""internalType"":""address"",""name"":""to"",""type"":""address""},{""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""transferFrom"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""}]";
        }
    }
}