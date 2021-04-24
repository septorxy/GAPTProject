using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GAPT.Models
{
    public class ConnectionState
    {
        public ConnectionState(string name, string connID)
        {
            this.name = name;
            this.connID = connID;
        }

        public string name { get; set; }
        public string connID { get; set; }
    }
}
