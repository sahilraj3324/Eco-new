using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Backend.Models
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        [Required]
        public string SellerId { get; set; }

        public string Category { get; set; }
        public string Brand { get; set; }
        public string Material { get; set; }

        public string Status { get; set; } = "In Review";

        // --- Images ---
        public string ImageUrlsJson { get; set; }

        [NotMapped]
        public List<string> ImageUrls
        {
            get => string.IsNullOrEmpty(ImageUrlsJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(ImageUrlsJson);
            set => ImageUrlsJson = JsonSerializer.Serialize(value);
        }

        // --- Size-Color-Weight Variants ---
        public string VariantsJson { get; set; }

        [NotMapped]
        public List<ProductVariant> Variants
        {
            get
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(VariantsJson))
                        return new List<ProductVariant>();

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    return JsonSerializer.Deserialize<List<ProductVariant>>(VariantsJson, options);
                }
                catch
                {
                    return new List<ProductVariant>(); // fallback to empty if corrupted JSON
                }
            }
            set
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                VariantsJson = JsonSerializer.Serialize(value, options);
            }
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Subcategory { get; set; }
        public string Gst { get; set; }
        public string Hsn1 { get; set; }
        public string MOQ { get; set; }
        public string PiecesPerPack { get; set; }
        public string FitShape { get; set; }
        public string NeckType { get; set; }
        public string Occasion { get; set; }
        public string Pattern { get; set; }
        public string SleeveLength { get; set; }
        public string ShipsIn { get; set; }
        public string MainImage { get; set; }
        public string Top { get; set; }
        public string Trending { get; set; }
        
    }

    public class ProductVariant
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Size { get; set; }
        public string Color { get; set; }
        public string Weight { get; set; }
        public string Stock { get; set; }
        public decimal Price { get; set; }
       
    }
}
