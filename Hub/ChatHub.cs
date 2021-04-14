using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Testing.Models;
using System;
using StackExchange.Redis;
using System.Net.Sockets;
using System.Threading;
using Newtonsoft.Json;

namespace Testing
{
    public class ChatHub : Hub 
    { 
    IDatabase cache = ConnectionCache.GetDatabase();
        public Task BroadcastMessage(string type, string name, int x, int y)
        {
            if (type.Equals("newPlayer") && type.Equals("updatePlayer")) { 
                PlayerState playerState = new PlayerState(name, x, y);
                cache.StringSet(name, JsonConvert.SerializeObject(playerState));
                //string cacheCommand = "PING";
                //Console.WriteLine("Cache response : " + cache.Execute(cacheCommand).ToString() + " " + type);
            } else if (type.Equals("getPlayer"))
            {
                PlayerState StateFromCache = JsonConvert.DeserializeObject<PlayerState>(cache.StringGet(name));
                x = StateFromCache.x;
                y = StateFromCache.y;
            }
            return Clients.All.SendAsync("broadcastMessage", type, name, x, y);
        }

        public Task Echo(string name, int x, int y) =>
            Clients.Client(Context.ConnectionId)
                   .SendAsync("echo", name, $"{x}, {y} (echo from server)");
    }
}