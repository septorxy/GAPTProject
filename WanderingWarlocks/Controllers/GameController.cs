/*Custom controller to control the views made for the game-related pages (Instructions and the game itself)*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WanderingWarlocks.Controllers
{
    public class GameController : Controller
    {
        

        [Authorize] //User must be logged in to play the game
        public IActionResult Play()
        {
            
            /*A user who has never clicked play before will be redirected to the Instructions view
              A cookie is then saved to indicate that the user has seen the instructions
              If the cookie is present, the user will be taken directly to the game*/

            CookieOptions option = new CookieOptions();
            if (Request.Cookies["instrCookie"] != null)
            {
                return View(); //Continue to the game normally if the cookie is present
            }
            else
            {
                option.Expires = DateTime.Now.AddMonths(3); //Set cookie expiration to 3 months from creation
                Response.Cookies.Append("instrCookie", "seen", option); //Append cookie to response
                return RedirectToAction("Instructions"); //Redirect user to instructions page
            }
        }

        public IActionResult Instructions()
        {
            return View();
        }
    }
}
