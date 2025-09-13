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
  // Fetch dynamic category counts
  const { data: categoryCounts, isLoading } = useQuery({
    queryKey: ['/api/categories/counts'],
  });

  // Filter to only show the four specified categories in order (data-only filter)
  const allowedCategories = ["taxidermy", "wet-specimens", "bones-skulls", "occult"];
  const counts = Array.isArray(categoryCounts) ? categoryCounts : [];
  const categories = allowedCategories.map(slug => counts.find(c => c.slug === slug)).filter(Boolean);

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
    <div className="flex flex-wrap gap-4 justify-center" data-testid="category-grid">
      {categories.map((category: any) => (
        <Link key={category.slug} to={`/browse?category=${category.slug}`}>
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" data-testid={`category-${category.slug}`}>
            <span className="font-medium text-foreground" data-testid={`category-name-${category.slug}`}>
              {category.name}
            </span>
            <span className="ml-2 text-sm text-foreground/70" data-testid={`category-count-${category.slug}`}>
              ({category.count})
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
