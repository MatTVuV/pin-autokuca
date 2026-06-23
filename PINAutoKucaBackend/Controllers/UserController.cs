using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PINAutokucaAPI.Data;
using PINAutokucaAPI.Entities;

namespace PINAutokucaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.AKUsers
                .Include(u => u.PovijestTransakcija)
                .Select(u => new
                {
                    Id = u.Id,
                    ImePrezime = u.ImePrezime,
                    Oib = u.OIB,
                    Email = u.Email,
                    Telefon = u.Telefon,
                    Adresa = u.Adresa,
                    PovijestTransakcija = u.PovijestTransakcija.Select(t => new
                    {
                        CarRegistracija = t.CarRegistracija,
                        Tip = t.Tip, 
                        DatumTransakcije = t.DatumTransakcije,
                        CarInfo = _context.Cars
                            .Where(c => c.Registracija == t.CarRegistracija)
                            .Select(c => c.Marka + " " + c.Model)
                            .FirstOrDefault()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] User user)
        {
            if (await _context.AKUsers.AnyAsync(u => u.OIB == user.OIB))
                return BadRequest("Korisnik s ovim OIB-om već postoji.");

            _context.AKUsers.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User userUpdate)
        {
            if (id != userUpdate.Id) return BadRequest("Identifikatori se ne podudaraju.");

            var postojaoUser = await _context.AKUsers.AnyAsync(u => u.Id == id);
            if (!postojaoUser) return NotFound("Korisnik nije pronađen.");

            _context.Entry(userUpdate).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.AKUsers.FindAsync(id);
            if (user == null) return NotFound();

            // Provjera ima li korisnik transakcije (Integritet baze)
            var imaTransakcije = await _context.Transactions.AnyAsync(t => t.KorisnikId == id);
            if (imaTransakcije)
            {
                return BadRequest("Nije moguće obrisati korisnika jer ima aktivnu povijest kupnji ili posudbi.");
            }

            _context.AKUsers.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
