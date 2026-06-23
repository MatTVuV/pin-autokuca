using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PINAutokucaAPI.Entities
{
    public class GalerijaFotografija
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PutanjaSlike { get; set; } = string.Empty;

        [Required]
        public string CarRegistracija { get; set; } = string.Empty;

        [ForeignKey(nameof(CarRegistracija))]
        [JsonIgnore]
        public Car? Car { get; set; }
    }
}
