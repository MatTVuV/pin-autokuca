using System.ComponentModel.DataAnnotations;

namespace PINAutokucaAPI.Entities
{
    public class Car
    {
        [Key]
        [Required]
        [StringLength(20)]
        public string Registracija { get; set; } = string.Empty; 

        [Required]
        [StringLength(50)] 
        public string Marka { get; set; } = string.Empty;

        [Required]
        [StringLength(50)] 
        public string Model { get; set; } = string.Empty;
        [Required] public int GodinaProizvodnje { get; set; }
        [Required] public EngineType Motor { get; set; }
        [Required] public int SnagaKW { get; set; }
        [Required] public TransmissionType Mjenjac { get; set; }
        [Required] public int PrijedeniKilometri { get; set; }
        [Required] public decimal Cijena { get; set; }
        [Required] public DateTime DatumIstekaRegistracije { get; set; }
        [Required] public DateTime DatumDolaska { get; set; }
        [Required] public string? UserId { get; set; }
        public DateTime? DatumProdaje { get; set; } 
        [Required] public CarStatus Status { get; set; } = CarStatus.Raspoloziv;

        public List<GalerijaFotografija> GalerijaFotografija { get; set; } = new List<GalerijaFotografija>();
        public List<Transaction> Transakcije { get; set; } = new List<Transaction>();
    }
}
