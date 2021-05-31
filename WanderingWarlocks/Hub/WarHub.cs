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
        //Interval between messages of when the cache should be updated
        int interval = 30;


        public Task BroadcastMessage(string type, object inMessage, int count)
        {
        //Checking if inMessage is null to make sure there is no error int the deserialisation
            if (inMessage != null)
            {
            //Deserialising the incoming JSON format object to PlayerState in order to obtain key 
                PlayerState state = JsonConvert.DeserializeObject<PlayerState>(inMessage.ToString());

                if (type.Equals("disconnection"))
                {
                //Converting the incoming inMessage from onDisconnectAsync to a format readable by the JS
                    inMessage = inMessage.ToString();
                }
                string key = state.key;

                if (type.Equals("newPlayer"))
                {
                //New Player Code
                    IDatabase cache = ConnectionCache.GetDatabase();
                    //This is where the Redis Cache is first used within the project.
                    //The moment a Connection is established:
                    cache.StringSet(key, inMessage.ToString()); //The key is mapped to the player details
                    cache.StringSet(Context.ConnectionId, key); //The connectionId is mapped to the key
                    //the key is added to myKeys
                    if (cache.StringGet("myKeys").ToString() == null || cache.StringGet("myKeys").ToString().Equals(""))
                    {
                    //If myKeys is empty
                        cache.StringSet("myKeys", key);
                    }
                    else
                    {
                    //If myKeys Exists
                        bool exists = false;
                        string[] keysArr = cache.StringGet("myKeys").ToString().Split(",");
                        for (int i = 0; i < keysArr.Length; i++)
                        {
                        //Checking if there was a Redis error as to not have multiple of the same username in myKeys
                            if (keysArr[i].Equals(key))
                            {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists)
                        {
                        //Add a key delimited by a ','
                            string keys = cache.StringGet("myKeys") + "," + key;
                            cache.StringSet("myKeys", keys);
                        }
                    }
                }


                else if (type.Equals("updatePlayer"))
                {
                //Update the player within the Redis Cache with the updated info every interval
                    if (count == interval)
                    {
                        IDatabase cache = ConnectionCache.GetDatabase();
                        cache.StringSet(key, inMessage.ToString());

                    }
                }
                
            }
            return Clients.AllExcept(Context.ConnectionId).SendAsync("broadcastMessage", type, inMessage, count);

        }

        public Task getPlayers(string[] players)
        {
        //Task to return all the players in myKeys with their data to initiate the opponents on other players' browsers
            int counter = 0;
            IDatabase cache = ConnectionCache.GetDatabase();
            if (cache.StringGet("myKeys").ToString() == null) { return Clients.All.SendAsync("getPlayers", players); }
            string[] keys = cache.StringGet("myKeys").ToString().Split(",");
            players = new string[keys.Length];
            foreach (String key in keys)
            {
                players[counter] = cache.StringGet(key).ToString();
                counter++;
            }
            return Clients.All.SendAsync("getPlayers", players);
        }

        public Task Hit(object shooterState, object damagedState)
        {
        //Task that triggers every time a hit happens
            if (shooterState != null && damagedState!=null){
            //The Redis Cache is updated with the current health and kill values of the shooting and damaged player
                PlayerState shooter = JsonConvert.DeserializeObject<PlayerState>(shooterState.ToString());
                PlayerState damaged = JsonConvert.DeserializeObject<PlayerState>(damagedState.ToString());
                IDatabase cache = ConnectionCache.GetDatabase();
                cache.StringSet(shooter.key, shooterState.ToString());
                cache.StringSet(damaged.key, damagedState.ToString());
            }

            return Clients.AllExcept(Context.ConnectionId).SendAsync("hit", shooterState, damagedState);
        }


        public override async Task OnDisconnectedAsync(Exception exception)
        {
        //This Task is triggered automatically once a disconnection between the SignalR and the user is detected
            IDatabase cache = ConnectionCache.GetDatabase();
            if (!(cache.StringGet("myKeys").ToString() == null || cache.StringGet("myKeys").ToString().Equals("")))
            {
            //The Key is retrieved from the cache using the connectionId saved when the player joined the game
                string key = cache.StringGet(Context.ConnectionId);
                string[] keys = cache.StringGet("myKeys").ToString().Split(",");
                var keyList = keys.ToList();
                keyList.Remove(key);
                keys = keyList.ToArray();
                //Key is removed from myKeys
                cache.StringSet("myKeys", String.Join(",", keys));
                //Player object is retrieved from the RedisCache
                var inMessage = cache.StringGet(key);
                //BroadcastMessage is called so that when the disconnection is detected the player character is deleted from
                //the opponents' browsers
                await BroadcastMessage("disconnection", inMessage, 0);
            }
            else
            {
                await BroadcastMessage("disconnection", null, 0);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
