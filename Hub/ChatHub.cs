using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Testing
{
    public class ChatHub : Hub
    {
         public Task BroadcastMessage(string type, object inMessage) =>
            Clients.All.SendAsync("broadcastMessage", type, inMessage)
    }
}
