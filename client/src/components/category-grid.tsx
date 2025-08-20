import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import wetSpecimenImage from "@assets/generated_images/Gothic_wet_specimen_jar_e0e9946f.png";
import bonesSkullsImage from "@assets/generated_images/Gothic_bone_collection_display_37b4e445.png";
import taxidermyImage from "@assets/generated_images/Victorian_bird_taxidermy_display_34e4d9b1.png";
import vintageMedicalImage from "@assets/generated_images/Vintage_medical_laboratory_setup_8123eab0.png";

const categories = [
  {
    id: "wet-specimens",
    name: "Wet Specimens",
    slug: "wet-specimens",
    icon: "🫙",
    image: wetSpecimenImage,
    count: 142
  },
  {
    id: "bones-skulls",
    name: "Bones & Skulls",
    slug: "bones-skulls", 
    icon: "🦴",
    image: bonesSkullsImage,
    count: 89
  },
  {
    id: "taxidermy",
    name: "Taxidermy",
    slug: "taxidermy",
    icon: "🦅", 
    image: taxidermyImage,
    count: 67
  },
  {
    id: "vintage-medical",
    name: "Vintage Medical", 
    slug: "vintage-medical",
    icon: "⚗️",
    image: vintageMedicalImage,
    count: 203
  }
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="category-grid">
      {categories.map((category) => (
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
                    {category.count} items
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
