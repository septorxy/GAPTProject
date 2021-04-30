using GAPT.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using StackExchange.Redis;
using System.Net.Sockets;
using System.Threading;
using Newtonsoft.Json;
using System.Linq;

namespace GAPT
{
    public class ChatHub : Hub 
    {
        int interval = 30;


        public Task BroadcastMessage(string type, object inMessage, int count)
        {
            PlayerState state = JsonConvert.DeserializeObject<PlayerState>(inMessage.ToString());
            if (type == "disconnection")
            {
                //Console.WriteLine(inMessage.ToString());
                inMessage = inMessage.ToString();
            }
            string key = state.key;
            //Console.WriteLine(inMessage.ToString() + " wha");
            if (type.Equals("newPlayer")) {
                //PlayerState playerState = new PlayerState(name, x, y);
                //Console.WriteLine(Context.ConnectionId + " + " + key);
                IDatabase cache = ConnectionCache.GetDatabase();
                cache.StringSet(key, inMessage.ToString());
                cache.StringSet(Context.ConnectionId, key);
                if (cache.StringGet("myKeys").ToString() == null || cache.StringGet("myKeys").ToString().Equals(""))
                {
                    cache.StringSet("myKeys", key);
                    Console.WriteLine("HEre");
                }
                else
                { 
                    string keys = cache.StringGet("myKeys") + "," + key;
                    Console.WriteLine(keys);
                    cache.StringSet("myKeys", keys);
                }

            }else if (type.Equals("updatePlayer")) {
                if (count == interval) {
                    IDatabase cache = ConnectionCache.GetDatabase();
                    cache.StringSet(key, inMessage.ToString()); 
                    Console.WriteLine("Executed");

                }
                Console.WriteLine(count);
            }
            //else if (type.Equals("getPlayer"))
            //{
                //PlayerState StateFromCache = JsonConvert.DeserializeObject<PlayerState>(inMessage);
                //x = StateFromCache.x;
                //y = StateFromCache.y;
            //}
            return Clients.All.SendAsync("broadcastMessage", type, inMessage, count) ;
        }

        public Task getPlayers(string[] players)
        {
            int counter = 0;
            IDatabase cache = ConnectionCache.GetDatabase();
            if (cache.StringGet("myKeys").ToString() == null) { return Clients.All.SendAsync("getPlayers", players);}
            string[] keys = cache.StringGet("myKeys").ToString().Split(",");
            players = new string[keys.Length];
            foreach(String key in keys){
                
                players[counter] = cache.StringGet(key).ToString();
                counter++;
                //Console.WriteLine(players[counter-1] + "-----GET PLAYER");
            }
            return Clients.All.SendAsync("getPlayers", players);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            IDatabase cache = ConnectionCache.GetDatabase();
            string key = cache.StringGet(Context.ConnectionId);
            string[] keys = cache.StringGet("myKeys").ToString().Split(",");
            var keyList = keys.ToList();
            keyList.Remove(key);
            keys = keyList.ToArray();
            cache.StringSet("myKeys", String.Join(",", keys));
            var inMessage = cache.StringGet(key);
            Console.WriteLine(inMessage.ToString());
            await BroadcastMessage("disconnection", inMessage, 0);
            await base.OnDisconnectedAsync(exception);
           // return Clients.All.SendAsync("broadcastMessage", "disconnection", inMessage);
        }

    }
}