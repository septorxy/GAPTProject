********************************WANDERING WARLOCKS********************************

Welcome to Wandering Warlocks! This project was made by Kristina Pace, Cristina
Barbara, Liam Gatt and Luke Grixti for our GAPT project.
We're very pleased to present this 2D top-down shooting game, made for browsers.

*********************************RUNNING LOCALLY**********************************

Everything required to run the game locally can be found in the WanderingWarlocks
project folder. The only drawback is that you would only be able to play against
yourself.

**********************************USER SECRETS************************************

To run the game locally 3 user secrets are required. These can be added by opening
the developer command propmt from Visual Studio (or using Windows Command Prompt
in the game directory) and running the following commands:

dotnet user-secrets set ConnectionStrings:CacheConnection 
CurrGameStorage.redis.cache.windows.net:6380,
password=GCcEDg7KkTyivkDGHKRUHBI776eSvn1+5CevihAVSl8=,
ssl=True,
abortConnect=False

dotnet user-secrets set CacheConnection 
CurrGameStorage.redis.cache.windows.net,
abortConnect=false,
ssl=true,
allowAdmin=true,
password=GCcEDg7KkTyivkDGHKRUHBI776eSvn1+5CevihAVSl8=

dotnet user-secrets set Azure:SignalR:ConnectionString
Endpoint=https://wonderingwarlocks.service.signalr.net/;
AccessKey=HyuJGtCzdH//tEErXks+u5VWpAnHsq9G/BAier60Tws=;
Version=1.0;