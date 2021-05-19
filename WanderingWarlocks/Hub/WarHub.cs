using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using StackExchange.Redis;
using System.Net.Sockets;
using Newtonsoft.Json;
using System.Linq;
using WanderingWarlocks.Models;

namespace WanderingWarlocks
{
    public class WarHub : Hub
    {
        int interval = 30;


        public Task BroadcastMessage(string type, object inMessage, int count)
        {
            if (inMessage != null)
            {
                PlayerState state = JsonConvert.DeserializeObject<PlayerState>(inMessage.ToString());

                if (type == "disconnection")
                {
                    inMessage = inMessage.ToString();
                    //Console.WriteLine("Here");
                }
                string key = state.key;

                if (type.Equals("newPlayer"))
                {
                    Console.WriteLine("HereAM");
                    IDatabase cache = ConnectionCache.GetDatabase();
                    cache.StringSet(key, inMessage.ToString());
                    cache.StringSet(Context.ConnectionId, key);
                    if (cache.StringGet("myKeys").ToString() == null || cache.StringGet("myKeys").ToString().Equals(""))
                    {
                        cache.StringSet("myKeys", key);
                    }
                    else
                    {
                        string keys = cache.StringGet("myKeys") + "," + key;
                        cache.StringSet("myKeys", keys);
                    }
                }


                else if (type.Equals("updatePlayer"))
                {
                    //Console.WriteLine(count);
                    if (count == interval)
                    {
                        IDatabase cache = ConnectionCache.GetDatabase();
                        cache.StringSet(key, inMessage.ToString());
                        //Console.WriteLine("Executed");

                    }
                }
            }
                return Clients.AllExcept(Context.ConnectionId).SendAsync("broadcastMessage", type, inMessage, count);
         
        }

        public Task getPlayers(string[] players)
        {
            int counter = 0;
            IDatabase cache = ConnectionCache.GetDatabase();
            if (cache.StringGet("myKeys").ToString() == null) { return Clients.All.SendAsync("getPlayers", players); }
            string[] keys = cache.StringGet("myKeys").ToString().Split(",");
            players = new string[keys.Length];
            foreach (String key in keys)
            {
                players[counter] = cache.StringGet(key).ToString();
                //Console.WriteLine(players[counter]);
                counter++;
            }
            return Clients.All.SendAsync("getPlayers", players);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            //Console.WriteLine(exception + "Here");
            IDatabase cache = ConnectionCache.GetDatabase();
            if (cache.StringGet("myKeys").ToString() == null || cache.StringGet("myKeys").ToString().Equals(""))
            {
                string key = cache.StringGet(Context.ConnectionId);
                string[] keys = cache.StringGet("myKeys").ToString().Split(",");
                var keyList = keys.ToList();
                keyList.Remove(key);
                keys = keyList.ToArray();
                cache.StringSet("myKeys", String.Join(",", keys));
                var inMessage = cache.StringGet(key);

                //Console.WriteLine(inMessage.ToString());
                await BroadcastMessage("disconnection", inMessage, 0);
            }
            else 
            {
                await BroadcastMessage("disconnection", null, 0);
            }
            await base.OnDisconnectedAsync(exception);
        }

        //private  async Task OnConnectedAsync(Exception exception)
        // {
        //    IDatabase cache = ConnectionCache.GetDatabase();
        //    string key = cache.StringGet(Context.ConnectionId);
        //    string[] keys = cache.StringGet("myKeys").ToString().Split(",");
        //    var keyList = keys.ToList();
        //    var inMessage = cache.StringGet(key);
        //    await BroadcastMessage("newPlayer", inMessage, 0);
        //      await base.OnConnectedAsync(Exception);
        //  }

    }
}
