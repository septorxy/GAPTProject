using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Testing.Models
{
    public class UserEntity : TableEntity
    {
        public UserEntity()
        {
        }

        public UserEntity(string part, string row, DateTimeOffset time)
        {
            PartitionKey = part;
            RowKey = row;
            Timestamp = time;
        }

        public UserEntity(string part, string row)
        {
            PartitionKey = part;
            RowKey = row;
        }
    }
}
