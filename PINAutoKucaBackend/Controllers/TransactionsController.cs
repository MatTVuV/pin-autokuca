using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PINAutokucaAPI.Data;
using PINAutokucaAPI.DTOs;
using PINAutokucaAPI.Entities;

namespace PINAutokucaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class TransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransactionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
        {
            var car = await _context.Cars.FirstOrDefaultAsync(c => c.Registracija == dto.Registracija);
            if (car == null) return NotFound("Automobil nije pronađen.");

            if(car.Status != Entities.CarStatus.Raspoloziv)
            {
                return BadRequest("Automobil nije raspoloživ za prodaju ili posudbu.");
            }

            var customer = await _context.AKUsers.FindAsync(dto.KupacId);
            if (customer == null) return NotFound("Korisnik nije pronađen");
            
            if(dto.Tip == TransactionType.Prodaja)
            {
                car.Status = CarStatus.Prodan;
                car.DatumProdaje = DateTime.Now;
            }
            if(dto.Tip == TransactionType.Posudba)
            {
                if (dto.DatumPovrata == null || dto.DatumPovrata <= DateTime.Now)
                    return BadRequest("Morate navesti ispravan budući datum povrata za posudbu.");

                car.Status = CarStatus.Posuden;
            }

            var transaction = new Transaction
            {
                CarRegistracija = dto.Registracija,
                KorisnikId = dto.KupacId,
                Tip = dto.Tip,
                DatumTransakcije = DateTime.Now,
                DatumPovrata = dto.Tip == TransactionType.Posudba ? dto.DatumPovrata : null
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Uspješno provedena {dto.Tip}.", transactionId = transaction.Id });
        }


    }
}
