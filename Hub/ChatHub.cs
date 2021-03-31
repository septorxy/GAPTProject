using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Testing
{
    public class ChatHub : Hub
    {
        public Task BroadcastMessage(string type, object inMessage) =>
            Clients.All.SendAsync("broadcastMessage", type, inMessage);

       /* public Task Echo(string name, int x, int y) =>
            Clients.Client(Context.ConnectionId)
                   .SendAsync("echo", name, $"{x}, {y} (echo from server)");*/
    }
}
