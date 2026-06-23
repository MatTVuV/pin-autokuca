using PINAutokucaAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace PINAutokucaAPI.DTOs
{
    public class CarCreateDto
    {
        [Required][StringLength(20)] public string Registracija { get; set; } = string.Empty;
        [Required] public string Marka { get; set; } = string.Empty;
        [Required] public string Model { get; set; } = string.Empty;
        [Required] public int GodinaProizvodnje { get; set; }
        [Required] public EngineType Motor { get; set; }
        [Required] public int SnagaKW { get; set; }
        [Required] public TransmissionType Mjenjac { get; set; }
        [Required] public int PrijedeniKilometri { get; set; }
        [Required] public decimal Cijena { get; set; }
        [Required] public DateTime DatumIstekaRegistracije { get; set; }
        [Required] public DateTime DatumDolaska { get; set; }
    }
}
