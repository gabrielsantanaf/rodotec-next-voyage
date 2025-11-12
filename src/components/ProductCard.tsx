import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  title: string;
  image: string;
  features: string[];
  badge?: string;
  link: string;
}

const ProductCard = ({ title, image, features, badge, link }: ProductCardProps) => {
  return (
    <Card className="card-glow group overflow-hidden rounded-2xl border-line bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <Badge className="absolute right-4 top-4 bg-brand text-white">
            {badge}
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="mb-4 font-heading text-xl font-bold text-foreground">
          {title}
        </h3>
        {/* Technical Bullets - Real Value */}
        <ul className="mb-6 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link to={link}>
          <Button variant="outline" className="w-full">
            Ver Detalhes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
