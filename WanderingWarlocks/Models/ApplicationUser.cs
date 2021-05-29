/*Extending IdentityUser so as to add a Kills field
 This is done for scalability, so that in the future each player can have total kills assignned to his account
 It would also make it possible for an all-time hall of fame to be implemented, adding competitiveness and a fun aspect*/

using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WanderingWarlocks.Models
{
    public class ApplicationUser : IdentityUser
    {

        [PersonalData] //Enabling the user to download their kill-count as part of their personal data
        public double Kills { get; set; }
    }
}
