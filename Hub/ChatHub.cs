using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Testing.Models;
using System;
using StackExchange.Redis;
using System.Net.Sockets;
using System.Threading;

namespace Testing
{
    public class ChatHub : Hub 
    { 
    
        public Task BroadcastMessage(string type, string name, int x, int y)
        {
            if (type.Equals("newPlayer")) { 
                IDatabase cache = ConnectionCache.GetDatabase();
                string cacheCommand = "PING";
                Console.WriteLine("Cache response : " + cache.Execute(cacheCommand).ToString() + " " + type);
            }
            return Clients.All.SendAsync("broadcastMessage", type, name, x, y);
        }

        public Task Echo(string name, int x, int y) =>
            Clients.Client(Context.ConnectionId)
                   .SendAsync("echo", name, $"{x}, {y} (echo from server)");
    }
}