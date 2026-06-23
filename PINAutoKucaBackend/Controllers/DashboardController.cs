using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PINAutokucaAPI.Data;
using PINAutokucaAPI.Entities;

namespace PinAutoKuca.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("counters")]
        public async Task<IActionResult> GetCounters()
        {
            var dostupni = await _context.Cars.CountAsync(c => c.Status == CarStatus.Raspoloziv);
            var prodani = await _context.Cars.CountAsync(c => c.Status == CarStatus.Prodan);
            var posudeni = await _context.Cars.CountAsync(c => c.Status == CarStatus.Posuden);
            var rezervirani = await _context.Cars.CountAsync(c => c.Status == CarStatus.Rezerviran);

            return Ok(new { Dostupni = dostupni, Prodani = prodani, Posudeni = posudeni });
        }

        [HttpGet("sales-by-month")]
        public async Task<IActionResult> GetSalesByMonth()
        {
            int trenutnaGodina = DateTime.Now.Year;

            var prodaja = await _context.Transactions
                .Where(t => t.Tip == TransactionType.Prodaja && t.DatumTransakcije.Year == trenutnaGodina)
                .GroupBy(t => t.DatumTransakcije.Month)
                .Select(g => new
                {
                    Mjesec = g.Key,
                    BrojProdanih = g.Count()
                })
                .OrderBy(g => g.Mjesec)
                .ToListAsync();

            return Ok(prodaja);
        }

        [HttpGet("top-brands")]
        public async Task<IActionResult> GetTopBrands()
        {
            var topMarke = await _context.Transactions
                .Where(t => t.Tip == TransactionType.Prodaja)
                .Include(t => t.Car)
                .GroupBy(t => t.Car!.Marka)
                .Select(g => new
                {
                    Marka = g.Key,
                    Kolicina = g.Count()
                })
                .OrderByDescending(g => g.Kolicina)
                .Take(5)
                .ToListAsync();

            return Ok(topMarke);
        }
    }
}
