using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Testing
{
    public class AppSettings
    {
        public string StorageConnectionString { get; set; }


        public static AppSettings LoadAppSettings()
        {
            string workingDirectory = Environment.CurrentDirectory;
            string path = Path.Combine(workingDirectory, "Settings.json");

            IConfigurationRoot configRoot = new ConfigurationBuilder()
                .AddJsonFile(path)
                .Build();
            AppSettings appSettings = configRoot.Get<AppSettings>();
            return appSettings;
        }
    }
}
