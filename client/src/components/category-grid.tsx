import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    id: "wet-specimens",
    name: "Wet Specimens",
    slug: "wet-specimens",
    icon: "🫙",
    image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80",
    count: 142
  },
  {
    id: "bones-skulls",
    name: "Bones & Skulls",
    slug: "bones-skulls", 
    icon: "🦴",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80",
    count: 89
  },
  {
    id: "taxidermy",
    name: "Taxidermy",
    slug: "taxidermy",
    icon: "🦅", 
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80",
    count: 67
  },
  {
    id: "vintage-medical",
    name: "Vintage Medical", 
    slug: "vintage-medical",
    icon: "⚗️",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80",
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
              <div className="absolute inset-0 bg-gothic-black/40 group-hover:bg-gothic-purple/40 transition-colors"></div>
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
