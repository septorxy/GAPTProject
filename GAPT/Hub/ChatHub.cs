using GAPT.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using StackExchange.Redis;
using System.Net.Sockets;
using System.Threading;
using Newtonsoft.Json;

namespace GAPT
{
    public class ChatHub : Hub 
    { 
    IDatabase cache = ConnectionCache.GetDatabase();
        public Task BroadcastMessage(string type, object inMessage)
        {
            PlayerState state = JsonConvert.DeserializeObject<PlayerState>(inMessage.ToString());
            
            string name = state.name;
            Console.WriteLine(name);
            if (type.Equals("newPlayer")) { 
                //PlayerState playerState = new PlayerState(name, x, y);
                cache.StringSet(name, inMessage.ToString());
                Console.WriteLine(inMessage.ToString());
            }else if (type.Equals("updatePlayer")) { 
                //PlayerState playerState = new PlayerState(name, x, y);
                cache.StringSet(name, inMessage.ToString());
                Console.WriteLine(cache.StringGet(name));
                String result = cache.StringGet(name);
                PlayerState stateName = JsonConvert.DeserializeObject<PlayerState>(result);
                Console.WriteLine(stateName.name);
            }
            else if (type.Equals("getPlayer"))
            {
                //PlayerState StateFromCache = JsonConvert.DeserializeObject<PlayerState>(inMessage);
               // x = StateFromCache.x;
                //y = StateFromCache.y;
            }
            return Clients.All.SendAsync("broadcastMessage", type, inMessage);
        }

        public Task Echo(string name, int x, int y) =>
            Clients.Client(Context.ConnectionId)
                   .SendAsync("echo", name, $"{x}, {y} (echo from server)");
    }
}