using System.Security.Claims;
using backend.Models;
using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/tokens")]
    public class TokenController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<TokenTransaction> _transactionsCollection; 
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly string _orgAddress;
        private readonly string _orgPrivateKey;

        public TokenController(IMongoDatabase database, TokenService tokenService, IConfiguration configuration)
        {
            _usersCollection = database.GetCollection<User>("Users");
            _transactionsCollection = database.GetCollection<TokenTransaction>("TokenTransactions");
            _tokenService = tokenService;
            _configuration = configuration;
            _orgAddress = _configuration["Blockchain:OrganizationAddress"]!;
            _orgPrivateKey = _configuration["Blockchain:OrganizationPrivateKey"]!;
        }

        [HttpGet("user-wallet-balance")]
        public async Task<IActionResult> GetUserWalletBalance()
        {
            var user = await GetCurrentUser();
            if (user == null) return NotFound(new { message = "User not found." });
            if (string.IsNullOrEmpty(user.WalletAddress)) 
                return BadRequest(new { message = "Wallet address not set" });

            var balance = await _tokenService.GetBalance(user.WalletAddress);
            return Ok(new { balance });
        }

        [HttpGet("users-wallet-balances")]
        public async Task<IActionResult> GetUsersWalletInfo()
        {
            var users = await _usersCollection.Find(_ => true).ToListAsync();
            var walletInfos = new List<UserWalletInfoDto>();

            foreach (var user in users)
            {
                var walletInfo = new UserWalletInfoDto
                {
                    UserName = user.UserName,
                    WalletAddress = user.WalletAddress
                };

                if (!string.IsNullOrEmpty(user.WalletAddress))
                {
                    walletInfo.WalletBalance = await _tokenService.GetBalance(user.WalletAddress);
                }

                walletInfos.Add(walletInfo);
            }

            return Ok(walletInfos);
        }

        [HttpGet("user-site-balance")]
        public async Task<IActionResult> GetUserSiteBalance()
        {
            var user = await GetCurrentUser();
            if (user == null) return NotFound(new { message = "User not found." });

            return Ok(new { balance = user.TokenBalance });
        }

        [HttpGet("organization-wallet-balance")]
        public async Task<IActionResult> GetOrganizationWalletBalance()
        {
            var balance = await _tokenService.GetBalance(_orgAddress);
            return Ok(new { balance });
        }

        [HttpPost("deposit")]
        public async Task<IActionResult> DepositTokens([FromBody] TokenDepositDto depositDto)
        {
            var user = await GetCurrentUser();
            if (user == null) return NotFound(new { message = "User not found." });
            if (string.IsNullOrEmpty(user.WalletAddress)) 
                return BadRequest(new { message = "Wallet address not set" });
            if (string.IsNullOrEmpty(depositDto.PrivateKey)) 
                return BadRequest(new { message = "Private key not present." });

            try
            {
                var txHash = await _tokenService.Transfer(
                    depositDto.PrivateKey,
                    _orgAddress,
                    depositDto.Amount
                );

                var update = Builders<User>.Update.Inc(u => u.TokenBalance, depositDto.Amount);
                await _usersCollection.UpdateOneAsync(u => u.Id == user.Id, update);
                
                var transaction = new TokenTransaction
                {
                    UserId = user.Id,
                    Amount = depositDto.Amount,
                    TransactionHash = txHash,
                    Type = "deposit"
                };
                await _transactionsCollection.InsertOneAsync(transaction);

                return Ok(new { 
                    message = "Tokens deposited successfully",
                    transactionHash = txHash 
                });

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to deposit tokens: {ex.Message}" });
            }
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> WithdrawTokens([FromBody] decimal amount)
        {
            var user = await GetCurrentUser();
            if (user == null) return NotFound(new { message = "User not found." });
            if (string.IsNullOrEmpty(user.WalletAddress)) 
                return BadRequest(new { message = "Wallet address not set" });
            if (user.TokenBalance < amount)
                return BadRequest(new { message = "Insufficient balance" });

            try
            {
                var txHash = await _tokenService.Transfer(
                    _orgPrivateKey,
                    user.WalletAddress,
                    amount
                );

                var update = Builders<User>.Update.Inc(u => u.TokenBalance, -(int)amount);
                await _usersCollection.UpdateOneAsync(u => u.Id == user.Id, update);

                var transaction = new TokenTransaction
                {
                    UserId = user.Id,
                    Amount = (int)amount,
                    TransactionHash = txHash,
                    Type = "withdraw"
                };
                await _transactionsCollection.InsertOneAsync(transaction);

                return Ok(new { 
                    message = "Tokens withdrawn successfully",
                    transactionHash = txHash 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to withdraw tokens: {ex.Message}" });
            }
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetUserTransactions()
        {
            var user = await GetCurrentUser();
            if (user == null) return NotFound(new { message = "User not found." });

            var transactions = await _transactionsCollection
                .Find(t => t.UserId == user.Id)
                .SortByDescending(t => t.Date)
                .ToListAsync();

            return Ok(transactions);
        }

        private async Task<User> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        }
    }
}