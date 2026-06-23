using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PINAutokucaAPI.Entities
{
    public class Transaction
    {
        [Key] public int Id { get; set; }
        [Required] public string CarRegistracija { get; set; } = string.Empty;
        [ForeignKey(nameof(CarRegistracija))] public Car? Car { get; set; }
        [Required] public int KorisnikId { get; set; }
        [ForeignKey(nameof(KorisnikId))] public User? Korisnik { get; set; }
        [Required] public TransactionType Tip { get; set; } 
        [Required] public DateTime DatumTransakcije { get; set; }
        public DateTime? DatumPovrata { get; set; } 
    }
}
