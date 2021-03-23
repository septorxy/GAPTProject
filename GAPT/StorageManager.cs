using Microsoft.Data.SqlClient;
using System;
using System.Data;

namespace GAPTProj
{

    public class StorageManager
    {

        SqlConnectionStringBuilder builder;
        SqlConnection conn;
        SqlCommand command;
        SqlDataReader read;

        private void connectUserDb()
        {
            try
            {
                builder = new SqlConnectionStringBuilder();

                builder.DataSource = "user-server.database.windows.net";
                builder.UserID = "liamGatt";
                builder.Password = "PorterTheBest!";
                builder.InitialCatalog = "UserDb";

                conn = new SqlConnection(builder.ConnectionString);
            }
            catch(SqlException e)
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
            catch(SqlException e)
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
            catch(SqlException e)
            {
                Console.WriteLine(e.ToString());
            }
        }

        public void getUser(int userId)
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

    }
}
