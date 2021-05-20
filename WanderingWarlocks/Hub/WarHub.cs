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
            Console.WriteLine(inMessage.ToString());
            PlayerState state = JsonConvert.DeserializeObject<PlayerState>(inMessage.ToString());
            if (type == "disconnection")
            {
                inMessage = inMessage.ToString();
                //Console.WriteLine("Here");
            }
            string key = state.key;
            if (type.Equals("newPlayer"))
            {
                IDatabase cache = ConnectionCache.GetDatabase();
                cache.StringSet(key, inMessage.ToString());
                Console.WriteLine(inMessage.ToString());
                cache.StringSet(Context.ConnectionId, key);
                if (cache.StringGet("myKeys1").ToString() == null || cache.StringGet("myKeys1").ToString().Equals(""))
                {
                    cache.StringSet("myKeys1", key);
                }
                else
                {
                    string keys = cache.StringGet("myKeys1") + "," + key;
                    cache.StringSet("myKeys1", keys);
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
            }else if (type.Equals("health"))
            {
                Console.WriteLine("HEALTH ENTERED " + inMessage.ToString());
                IDatabase cache = ConnectionCache.GetDatabase();
                cache.StringSet(key, inMessage.ToString());
            }
            return Clients.AllExcept(Context.ConnectionId).SendAsync("broadcastMessage", type, inMessage, count);
        }

        public Task getPlayers(string[] players)
        {
            int counter = 0;
            IDatabase cache = ConnectionCache.GetDatabase();
            if (cache.StringGet("myKeys1").ToString() == null) { return Clients.All.SendAsync("getPlayers", players); }
            string[] keys = cache.StringGet("myKeys1").ToString().Split(",");
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
            try { 
            IDatabase cache = ConnectionCache.GetDatabase();
            string key = cache.StringGet(Context.ConnectionId);
            string[] keys = cache.StringGet("myKeys1").ToString().Split(",");
            var keyList = keys.ToList();
            keyList.Remove(key);
            keys = keyList.ToArray();
            cache.StringSet("myKeys1", String.Join(",", keys));
            var inMessage = cache.StringGet(key);
            //Console.WriteLine(inMessage.ToString());
            await BroadcastMessage("disconnection", inMessage, 0);
            }catch(Exception e)
            {
                Console.WriteLine(e);
            }
            await base.OnDisconnectedAsync(exception);
        }

        //private  async Task OnConnectedAsync(Exception exception)
        // {
        //    IDatabase cache = ConnectionCache.GetDatabase();
        //    string key = cache.StringGet(Context.ConnectionId);
        //    string[] keys = cache.StringGet("myKeys1").ToString().Split(",");
        //    var keyList = keys.ToList();
        //    var inMessage = cache.StringGet(key);
        //    await BroadcastMessage("newPlayer", inMessage, 0);
        //      await base.OnConnectedAsync(Exception);
        //  }

    }
}
