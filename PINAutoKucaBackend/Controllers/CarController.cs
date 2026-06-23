using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PINAutokucaAPI.Data;
using PINAutokucaAPI.DTOs;
using PINAutokucaAPI.Entities;
using Amazon.S3;
using Amazon.S3.Model;

namespace PINAutokucaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CarController(ApplicationDbContext context)
        {
            _context = context;
        }

        /* // LOKALNO: Dohvat svih vozila
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Car>>> GetCars()
        {
            try
            {
                var cars = await _context.Cars
                    .Include(c => c.GalerijaFotografija)
                    .ToListAsync();

                return Ok(cars);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška na bazi podataka: {ex.Message}");
            }
        }
        */

        // AWS S3: Dohvat svih vozila sa generisanjem Pre-signed URL-ova
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCars([FromServices] S3Service s3Service)
        {
            var cars = await _context.Cars.Include(c => c.GalerijaFotografija).ToListAsync();

            foreach (var car in cars)
            {
                foreach (var foto in car.GalerijaFotografija)
                {
                    foto.PutanjaSlike = s3Service.GetPresignedUrl(foto.PutanjaSlike);
                }
            }

            return Ok(cars);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Car>> PostCar([FromBody] CarCreateDto dto)
        {
            if (await _context.Cars.AnyAsync(c => c.Registracija == dto.Registracija))
                return BadRequest("Automobil s ovom registracijom već postoji.");

            string trenutniKorisnik = User.Identity?.Name ?? "Sustav";

            var car = new Car
            {
                Registracija = dto.Registracija,
                Marka = dto.Marka,
                Model = dto.Model,
                GodinaProizvodnje = dto.GodinaProizvodnje,
                Motor = (EngineType)dto.Motor,
                SnagaKW = dto.SnagaKW,
                Mjenjac = dto.Mjenjac,
                PrijedeniKilometri = dto.PrijedeniKilometri,
                Cijena = dto.Cijena,
                DatumIstekaRegistracije = dto.DatumIstekaRegistracije,
                DatumDolaska = dto.DatumDolaska,
                Status = CarStatus.Raspoloziv,
                UserId = trenutniKorisnik
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            // Referencira se na GetAllCars jer je GetCars zakomentiran
            return CreatedAtAction(nameof(GetAllCars), new { id = car.Registracija }, car);
        }

        // AWS S3: Dohvat jednog vozila sa generisanjem Pre-signed URL-ova
        [HttpGet("{registracija}")]
        [AllowAnonymous]
        public async Task<ActionResult<Car>> GetCar(string registracija, [FromServices] S3Service s3Service)
        {
            var car = await _context.Cars
                .Include(c => c.GalerijaFotografija)
                .FirstOrDefaultAsync(c => c.Registracija == registracija);

            if (car == null)
                return NotFound("Automobil nije pronađen.");

            foreach (var foto in car.GalerijaFotografija)
            {
                foto.PutanjaSlike = s3Service.GetPresignedUrl(foto.PutanjaSlike);
            }

            return Ok(car);
        }

        // AWS S3: Upload slika direktno na AWS S3 sa provjerom limita (max 10 slika)
        [HttpPost("{registracija}/upload-images")]
        public async Task<IActionResult> UploadImages(string registracija, List<IFormFile> files, [FromServices] S3Service s3Service)
        {
            var car = await _context.Cars.Include(c => c.GalerijaFotografija).FirstOrDefaultAsync(c => c.Registracija == registracija);
            if (car == null) return NotFound("Vozilo ne postoji.");

            if (car.Status == CarStatus.Prodan || car.Status == CarStatus.Posuden)
                return BadRequest("Nije moguće dodavati slike za prodana ili posuđena vozila.");

            if (files == null || files.Count == 0) return BadRequest("Nijedna slika nije odabrana.");

            // Provjera maksimalnog broja slika (max 10)
            if (car.GalerijaFotografija.Count + files.Count > 10)
                return BadRequest($"Maksimalan broj slika po vozilu je 10. Trenutno vozilo ima {car.GalerijaFotografija.Count} slika.");

            foreach (var file in files)
            {
                // Slanje izravno na AWS S3
                string s3Key = await s3Service.UploadFileAsync(file, registracija);

                var foto = new GalerijaFotografija
                {
                    CarRegistracija = registracija,
                    PutanjaSlike = s3Key // Sprema se S3 ključ
                };
                _context.GalerijaFotografija.Add(foto);
            }

            await _context.SaveChangesAsync();
            return Ok("Slike uspješno spremljene na AWS S3 i povezane s vozilom.");
        }

        /*
        // LOKALNO: Upload slika na lokalni disk servera
        [HttpPost("{registracija}/upload-images")]
        public async Task<IActionResult> UploadImages(string registracija, List<IFormFile> files)
        {
            var car = await _context.Cars
                .Include(c => c.GalerijaFotografija)
                .FirstOrDefaultAsync(c => c.Registracija == registracija);

            if (car == null) return NotFound("Vozilo ne postoji.");

            if (car.Status == CarStatus.Prodan || car.Status == CarStatus.Posuden)
                return BadRequest("Nije moguće dodavati slike za prodana ili posuđena vozila.");

            if (files == null || files.Count == 0) return BadRequest("Nijedna slika nije odabrana.");

            if (car.GalerijaFotografija.Count + files.Count > 10)
            {
                return BadRequest($"Maksimalan broj slika po vozilu je 10. Trenutno vozilo ima {car.GalerijaFotografija.Count} slika.");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var uniqueFileName = $"{registracija}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var hostUrl = $"{Request.Scheme}://{Request.Host}";
                    var localImageUrl = $"{hostUrl}/images/{uniqueFileName}";

                    var foto = new GalerijaFotografija
                    {
                        CarRegistracija = registracija,
                        PutanjaSlike = localImageUrl
                    };
                    _context.GalerijaFotografija.Add(foto);
                }
            }

            await _context.SaveChangesAsync();
            return Ok("Slike uspješno spremljene lokalno i povezane s vozilom u MSSQL bazi.");
        }
        */

        [HttpDelete("images/{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var foto = await _context.GalerijaFotografija.FindAsync(id);
            if (foto == null) return NotFound("Slika nije pronađena u bazi podataka.");

            var car = await _context.Cars.FindAsync(foto.CarRegistracija);
            if (car != null && (car.Status == CarStatus.Prodan || car.Status == CarStatus.Posuden))
            {
                return BadRequest("Nije moguće brisati slike za prodana ili posuđena vozila.");
            }

            // Brisanje fizičke datoteke s lokalnog diska (ako postoji)
            try
            {
                var fileName = Path.GetFileName(foto.PutanjaSlike);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Greška pri brisanju datoteke s diska: {ex.Message}");
            }

            _context.GalerijaFotografija.Remove(foto);
            await _context.SaveChangesAsync();

            return Ok("Slika uspješno obrisana s diska i iz baze podataka.");
        }

        [HttpPut("{registracija}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutCar(string registracija, [FromBody] Car carUpdate)
        {
            if (registracija != carUpdate.Registracija) return BadRequest("Registracije se ne podudaraju.");

            var postojaoCar = await _context.Cars.AsNoTracking().FirstOrDefaultAsync(c => c.Registracija == registracija);
            if (postojaoCar == null) return NotFound("Automobil nije pronađen.");

            if (postojaoCar.Status == CarStatus.Prodan || postojaoCar.Status == CarStatus.Posuden)
            {
                return BadRequest("Nije moguće ažurirati automobil koji je prodan ili posuđen.");
            }

            _context.Entry(carUpdate).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{registracija}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCar(string registracija)
        {
            var car = await _context.Cars.FindAsync(registracija);
            if (car == null) return NotFound();

            if (car.Status == CarStatus.Prodan || car.Status == CarStatus.Posuden)
            {
                return BadRequest("Nije moguće obrisati automobil koji je prodan ili posuđen.");
            }

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}