using Microsoft.AspNetCore.Authorization;
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
        public IActionResult Game()
        {
            return View();
        }
    }
}
