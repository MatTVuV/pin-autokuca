using PINAutokucaAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace PINAutokucaAPI.DTOs
{
    public class TransactionCreateDto
    {
        [Required] public string Registracija { get; set; } = string.Empty;
        [Required] public int KupacId { get; set; }
        [Required] public TransactionType Tip { get; set; }
        public DateTime? DatumPovrata { get; set; }
    }
}
