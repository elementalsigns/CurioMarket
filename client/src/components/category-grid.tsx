import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import wetSpecimenImage from "@assets/generated_images/Gothic_snake_specimen_jar_51bc9d48.png";
import bonesSkullsImage from "@assets/generated_images/Gothic_bone_collection_display_37b4e445.png";
import taxidermyImage from "@assets/generated_images/Victorian_bird_taxidermy_display_34e4d9b1.png";
import vintageMedicalImage from "@assets/generated_images/Vintage_medical_laboratory_setup_8123eab0.png";
import jewelryImage from "@assets/generated_images/Gothic_vintage_jewelry_display_86ce4b33.png";
import occultImage from "@assets/generated_images/Occult_magical_artifacts_display_e0cd536b.png";

// Static category data with images - counts will be fetched dynamically
const categoryImages = {
  "wet-specimens": {
    icon: "🫙",
    image: wetSpecimenImage,
  },
  "bones-skulls": {
    icon: "🦴", 
    image: bonesSkullsImage,
  },
  "taxidermy": {
    icon: "🦅",
    image: taxidermyImage,
  },
  "vintage-medical": {
    icon: "⚗️",
    image: vintageMedicalImage,
  },
  "jewelry": {
    icon: "💍",
    image: jewelryImage,
  },
  "occult": {
    icon: "🔮",
    image: occultImage,
  },
  "wholesale": {
    icon: "📦",
    image: undefined, // Can add specific image later if needed
  }
};

export default function CategoryGrid() {
  // Fetch all categories (will vary based on seller listings)
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Use real categories that vary based on seller listings
  const processedCategories = (categories as any[])?.map((category: any) => ({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    icon: "🏪", // Generic shop icon that works for all categories
    image: undefined, // No static images - will vary based on seller use
    count: 0 // Will be filled dynamically based on actual listings
  })) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="category-grid">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-effect rounded-2xl overflow-hidden">
            <div className="aspect-square bg-zinc-800/50 animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="category-grid">
      {processedCategories.map((category: any) => (
        <Link key={category.id} to={`/browse?category=${category.slug}`}>
          <Card className="glass-effect rounded-2xl overflow-hidden hover-lift cursor-pointer group" data-testid={`category-${category.id}`}>
            <div className="aspect-square bg-cover bg-center relative" style={{backgroundImage: `url(${category.image})`}}>
              <div className="absolute inset-0 bg-background/40 group-hover:bg-primary/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2" data-testid={`category-icon-${category.id}`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold" data-testid={`category-name-${category.id}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/80 mt-1" data-testid={`category-count-${category.id}`}>
                    Browse Category
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
