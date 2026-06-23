using System.ComponentModel.DataAnnotations;

namespace PINAutokucaAPI.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required][StringLength(100)] public string ImePrezime { get; set; } = string.Empty;
        [Required][StringLength(11), MinLength(11)] public string OIB { get; set; } = string.Empty;
        [Required] public string Email { get; set; } = string.Empty;
        [Required] public string Telefon { get; set; } = string.Empty;
        [Required][StringLength(200)] public string Adresa { get; set; } = string.Empty;
        public List<Transaction> PovijestTransakcija { get; set; } = new List<Transaction>();
    }
}

