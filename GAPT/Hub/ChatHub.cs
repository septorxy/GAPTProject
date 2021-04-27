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
        private Exception exception;

        public Task BroadcastMessage(string type, object inMessage)
        {
            PlayerState state = JsonConvert.DeserializeObject<PlayerState>(inMessage.ToString());
            if (type == "disconnection")
            {
                //Console.WriteLine(inMessage.ToString());
                inMessage = inMessage.ToString();
            }
            string name = state.name;
            //Console.WriteLine(inMessage.ToString() + " wha");
            if (type.Equals("newPlayer")) {
                //PlayerState playerState = new PlayerState(name, x, y);
                //Console.WriteLine(Context.ConnectionId + " + " + name);
                cache.StringSet(name, inMessage.ToString());
                cache.StringSet(Context.ConnectionId, name);
            }else if (type.Equals("updatePlayer")) { 
                cache.StringSet(name, inMessage.ToString());
            }
            else if (type.Equals("getPlayer"))
            {
        7        //PlayerState StateFromCache = JsonConvert.DeserializeObject<PlayerState>(inMessage);
               // x = StateFromCache.x;
                //y = StateFromCache.y;
            }
            return Clients.All.SendAsync("broadcastMessage", type, inMessage) ;
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            //Console.WriteLine(Context.ConnectionId);
            string name = cache.StringGet(Context.ConnectionId);
            var inMessage = cache.StringGet(name);
            //Console.WriteLine(inMessage.ToString());
            await BroadcastMessage("disconnection", inMessage);
            await base.OnDisconnectedAsync(exception);
           // return Clients.All.SendAsync("broadcastMessage", "disconnection", inMessage);
        }

        public Task Echo(string name, int x, int y) =>
            Clients.Client(Context.ConnectionId)
                   .SendAsync("echo", name, $"{x}, {y} (echo from server)");
    }
}