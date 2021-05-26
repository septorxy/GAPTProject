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
        

        [Authorize]
        public IActionResult Play()
        {
            CookieOptions option = new CookieOptions();
            if (Request.Cookies["instrCookie"] != null)
            {
                return View();
            }
            else
            {
                option.Expires = DateTime.Now.AddMonths(3);
                Response.Cookies.Append("instrCookie", "seen", option);
                return RedirectToAction("Instructions");
            }
        }

        public IActionResult Instructions()
        {
            return View();
        }
    }
}
