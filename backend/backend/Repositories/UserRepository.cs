using backend.Models;
using MongoDB.Driver;

namespace backend.Repositories
{
    public class UserRepository
    {
        private readonly IMongoCollection<User> _usersCollection;

        public UserRepository(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<User>("Users");
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _usersCollection.Find(_ => true).ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(string userId)
        {
            return await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _usersCollection.Find(u => u.UserName == username).FirstOrDefaultAsync();
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task CreateUserAsync(User user)
        {
            await _usersCollection.InsertOneAsync(user);
        }

        public async Task UpdateUserAsync(User user)
        {
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

        public async Task DeleteUserAsync(string userId)
        {
            await _usersCollection.DeleteOneAsync(u => u.Id == userId);
        }
    }
}
