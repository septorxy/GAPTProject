using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;

namespace Testing
{
    public class ChatHub : Hub
    {
        public Task BroadcastMessage(string type, object inMessage) { 
            Console.WriteLine(inMessage.ToString() + type);
            return Clients.All.SendAsync("broadcastMessage", type, inMessage);
        }

       /* public Task Echo(string name, int x, int y) =>
            Clients.Client(Context.ConnectionId)
                   .SendAsync("echo", name, $"{x}, {y} (echo from server)");*/
    }
}
