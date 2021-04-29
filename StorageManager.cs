//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.Extensions.Configuration;
//using Microsoft.Azure.Cosmos.Table;
//using Microsoft.Azure.Documents;
//using System.IO;
//using Testing.Models;
using System;
using System.Data;
using System.Data.SqlClient;

namespace Testing
{
	public class StorageManager
	{

		/*public static CloudStorageAccount CreateStorageAccountFromConnectionString(string storageConnectionString)
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
		} */
		SqlConnectionStringBuilder builder;
		SqlConnection conn;
		SqlCommand command;
		SqlDataReader read;

		private void connectUserDb()
		{
			try
			{
				builder = new SqlConnectionStringBuilder();

				builder.DataSource = "gaptserver.database.windows.net";
				builder.UserID = "gaptadmin";
				builder.Password = "wonderingWarlocks21";
				builder.InitialCatalog = "UserDb";

				conn = new SqlConnection(builder.ConnectionString);
			}
			catch (SqlException e)
			{
				Console.WriteLine(e.ToString());
			}
		}

		public void getAllUsers()
		{
			try
			{
				connectUserDb();
				conn.Open();
				string query = "SELECT * FROM [dbo].[users]";
				command = new SqlCommand(query, conn);
				read = command.ExecuteReader();

				while (read.Read())
				{
					Console.WriteLine("{0} {1} {2} {3}", read.GetInt32(0), read.GetString(1), read.GetString(2), read.GetString(3));
				}
				read.Close();
				conn.Close();
			}
			catch (SqlException e)
			{
				Console.WriteLine(e.ToString());
			}
		}

		public void insertUser(string name, string surname, string email)
		{
			try
			{
				connectUserDb();
				conn.Open();

				command = new SqlCommand(null, conn);
				command.CommandText = "INSERT INTO [dbo].[Users] VALUES(@name, @surname, @email);";

				SqlParameter nameParam = new SqlParameter("@name", SqlDbType.VarChar, 100);
				SqlParameter surnameParam = new SqlParameter("@surname", SqlDbType.VarChar, 100);
				SqlParameter emailParam = new SqlParameter("@email", SqlDbType.VarChar, 100);

				nameParam.Value = name;
				surnameParam.Value = surname;
				emailParam.Value = email;

				command.Parameters.Add(nameParam);
				command.Parameters.Add(surnameParam);
				command.Parameters.Add(emailParam);

				command.Prepare();
				command.ExecuteNonQuery();

				conn.Close();
			}
			catch (SqlException e)
			{
				Console.WriteLine(e.ToString());
			}
		}

		public void deleteUserById(int id)
		{
			try
			{
				connectUserDb();
				conn.Open();

				command = new SqlCommand(null, conn);
				command.CommandText = "DELETE FROM [dbo].[Users] WHERE UserId = @id;";

				SqlParameter idParam = new SqlParameter("@id", SqlDbType.Int, 0);

				idParam.Value = id;

				command.Parameters.Add(idParam);

				command.Prepare();
				command.ExecuteNonQuery();

				conn.Close();
			}
			catch (SqlException e)
			{
				Console.WriteLine(e.ToString());
			}
		}

		public void getUserById(int userId)
		{
			try
			{
				connectUserDb();
				conn.Open();

				command = new SqlCommand(null, conn);
				command.CommandText = "SELECT * FROM dbo.Users WHERE UserId = @id;";

				SqlParameter idParam = new SqlParameter("@id", SqlDbType.Int, 0);
				idParam.Value = userId;
				command.Parameters.Add(idParam);

				command.Prepare();

				read = command.ExecuteReader();

				if (read.HasRows)
				{
					while (read.Read())
					{
						Console.WriteLine("{0} {1} {2} {3}", read.GetInt32(0), read.GetString(1), read.GetString(2), read.GetString(3));
					}
				}
				else Console.WriteLine("No such user");
				read.Close();
				conn.Close();
			}
			catch (SqlException e)
			{
				Console.WriteLine(e.ToString());
			}


		}

		public void getUserByEmail(string email)
		{
			try
			{
				connectUserDb();
				conn.Open();

				command = new SqlCommand(null, conn);
				command.CommandText = "SELECT * FROM dbo.Users WHERE Email = @email;";

				SqlParameter emailParam = new SqlParameter("@email", SqlDbType.VarChar, 255);
				emailParam.Value = email;
				command.Parameters.Add(emailParam);

				command.Prepare();

				read = command.ExecuteReader();

				if (read.HasRows)
				{
					while (read.Read())
					{
						Console.WriteLine("{0} {1} {2} {3}", read.GetInt32(0), read.GetString(1), read.GetString(2), read.GetString(3));
					}
				}
				else Console.WriteLine("No such user");
				read.Close();
				conn.Close();
			}
			catch (SqlException e)
			{
				Console.WriteLine(e.ToString());
			}


		}
	}
}
