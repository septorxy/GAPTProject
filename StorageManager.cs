using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Azure.Documents;
using System.IO;
using Testing.Models;

namespace Testing
{
    public class StorageManager
    {

        public static CloudStorageAccount CreateStorageAccountFromConnectionString(string storageConnectionString)
        {
            CloudStorageAccount storageAccount;
            try
            {
                storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            }
            catch (FormatException)
            {
                Console.WriteLine("Invalid storage account information provided. Please confirm the AccountName and AccountKey are valid in the app.config file - then restart the application.");
                throw;
            }
            catch (ArgumentException)
            {
                Console.WriteLine("Invalid storage account information provided. Please confirm the AccountName and AccountKey are valid in the app.config file - then restart the sample.");
                Console.ReadLine();
                throw;
            }

            return storageAccount;

        }

        public static async Task<CloudTable> GetTableAsync()
        {
            string storageConnectionString = AppSettings.LoadAppSettings().StorageConnectionString;

            // Retrieve storage account information from connection string.
            CloudStorageAccount storageAccount = CreateStorageAccountFromConnectionString(storageConnectionString);

            // Create a table client for interacting with the table service
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());

            //Console.WriteLine("Create a Table for the demo");

            // Create a table client for interacting with the table service 
            CloudTable table = tableClient.GetTableReference("Users");
            if (await table.CreateIfNotExistsAsync())
            {
                //Console.WriteLine("Created Table named: {0}", "Users");
            }
            else
            {
                //Console.WriteLine("Table {0} already exists", "Users");
            }

            Console.WriteLine();
            return table;
        }

        public static async Task<UserEntity> RetrieveEntityUsingPointQueryAsync(CloudTable table, string partitionKey, string rowKey)
        {
            try
            {
                TableOperation retrieveOperation = TableOperation.Retrieve<UserEntity>(partitionKey, rowKey);
                TableResult result = await table.ExecuteAsync(retrieveOperation);
                UserEntity user = result.Result as UserEntity;
                if (user != null)
                {
                    Console.WriteLine("\t{0}\t{1}\t{2}", user.PartitionKey, user.RowKey, user.Timestamp);
                }

                if (result.RequestCharge.HasValue)
                {
                    Console.WriteLine("Request Charge of Retrieve Operation: " + result.RequestCharge);
                }

                return user;
            }
            catch (StorageException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }

        public static async Task<UserEntity> InsertOrMergeEntityAsync(CloudTable table, UserEntity entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException("entity");
            }

            try
            {
                // Create the InsertOrReplace table operation
                TableOperation insertOrMergeOperation = TableOperation.InsertOrMerge(entity);

                // Execute the operation.
                TableResult result = await table.ExecuteAsync(insertOrMergeOperation);
                UserEntity insertedUser = result.Result as UserEntity;

                if (result.RequestCharge.HasValue)
                {
                    Console.WriteLine("Request Charge of InsertOrMerge Operation: " + result.RequestCharge);
                }

                return insertedUser;
            }
            catch (StorageException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }

        public static async Task DeleteEntityAsync(CloudTable table, UserEntity deleteEntity)
        {
            try
            {
                if (deleteEntity == null)
                {
                    throw new ArgumentNullException("deleteEntity");
                }

                TableOperation deleteOperation = TableOperation.Delete(deleteEntity);
                TableResult result = await table.ExecuteAsync(deleteOperation);

                if (result.RequestCharge.HasValue)
                {
                    Console.WriteLine("Request Charge of Delete Operation: " + result.RequestCharge);
                }

            }
            catch (StorageException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
    }
}
